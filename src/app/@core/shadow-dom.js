export function Element(config) {
  return (...args) => {
    // args[0] extends Elem;

    args[0].prototype.query = (selector) => {
      return document.querySelector(config.selector + " " + selector);
    };
    args[0].prototype.setState = (object, key, val) => {
      eval(`object.${key}=val;`);
      window.__global[args[0].name][object.id].render();
    };

    // let generate = (_class, _config) => {
    // var configTemp = _config;
    // var classTemp = _class;
    customElements.define(
      config.selector,
      class extends CoreElements {
        constructor() {
          let _class = new args[0](config);
          if (!window.__global) {
            window.__global = {};
          }

          _class.id = parseInt(Math.random() * 1000000000);

          let templateUrl = config.templateUrl;
          let styleUrl = config.styleUrl;

          let scope = _class.scope;
          let props = _class.props;
          let emits = _class.emits;
          let dom = {};
          args[0].prototype.onload;
          let config1 = {
            dom,
            scope,
            props,
            emits,
            templateUrl,
            styleUrl,
            name: config.selector,
            component: _class,
          };
          super(config1);

          this.dom = dom;
          this.scope = scope;
        }
      }
    );
    return args[0];
  };
}

export class CoreElements extends HTMLElement {
  constructor(config) {
    super();
    this.config = config;
  }
  async getContents(str) {
    try {
      let contents = (
        await (await fetch("/views/" + this.config.templateUrl)).text()
      ).toString();
      let varibles = contents.match(/(?<=\{\{)(.*?)(?=\}\})/g);
      let emits = contents.match(/(?=\{)(.*?)(?=\})(.*?)=(.*?)"(.*?)"/g);
      let events = contents.match(/(?=\~)(.*?)(?=")(.*)(?=")/g);
      let models = contents.match(/\@model(.*?)(?<=")(.*?)(?=")/g);
      return {
        contents,
        varibles,
        events: events,
        models,
        emits,
      };
    } catch (err) {
      console.error(`not load >> ${str}`);
      return {
        contents: ``,
        varibles: [],
        events: [],
        models: [],
        emits,
      };
    }
  }

  async render() {
    let obj = await this.getContents(this.config.templateUrl);

    if (!window.__global[this.config.component.id]) {
      window.__global[this.config.component.id] = {};
      window.__global[this.config.component.id].class = this.config.component;
      window.__global[
        this.config.component.id
      ].scope = this.config.component.scope;
      window.__global[
        this.config.component.id
      ].emits = this.config.component.emits;
      window.__global[
        this.config.component.id
      ].props = this.config.component.props;
      window.__global[this.config.component.id].methods = {};
      window.__global[this.config.component.id].config = this.config;
    }

    Array.isArray(obj.models) &&
      obj.models.map((f) => {
        var d = f.split("=")[1].substr(1, f.split("=")[1].length - 1);

        var value;
        eval(`value=window.__global[${this.config.component.id}].${d}`);
        obj.contents = obj.contents.replaceAll(
          `${f}`,
          `value="${value}" onchange="window.__global[${this.config.component.id}].${d}=this.value;window.__global[${this.config.component.id}].render()"`
        );
      });

    // Array.isArray(obj.emits) &&
    //   obj.emits.map((f) => {
    //     debugger
    //     // var value;
    //     // eval(`value=window.__global[${this.config.component.id}].${f}`);
    //     // obj.contents = obj.contents.replaceAll(`{{${f}}}`, value);
    //   });

    Array.isArray(obj.varibles) &&
      obj.varibles.map((f) => {
        var value;
        eval(`value=window.__global[${this.config.component.id}].${f}`);
        obj.contents = obj.contents.replaceAll(`{{${f}}}`, value);
      });

    Array.isArray(obj.events) &&
      obj.events.map((f) => {
        let eventName = f.split("=")[0];
        let fnName = f.split('="')[1];
        window.__global[this.config.component.id].methods[
          fnName.split("(")[0]
        ] = this.config.component[fnName.split("(")[0]];

        let args = fnName
          .match(/(?<=\()(.*?)(?=\))/g)[0]
          .split(",")
          .map((f) => f.trim());
        args = args.map((f) => {
          if (["`", `"`, `'`].includes(f.substr(0, 1))) {
            return f; // varible 'sample1',"sample2",`sample3`
          } else if (f) {
            return `window.__global.${f}`;
          }
        });
        fnName = fnName.match(/(.*?)(?=\()/g)[0];

        obj.contents = obj.contents.replaceAll(
          f,
          `on${eventName.substr(1)}="window.__global[${
            this.config.component.id
          }].methods.${fnName}(window.__global[${
            this.config.component.id
          }].class,${args.join()})"`
        );
      });

    return {
      html: `<div class="div-element-${this.config.component.id}">${obj.contents}</div>`,
      emits: obj.emits,
    };
  }

  async connectedCallback() {
    this.setAttribute("vm-id", this.config.component.id);
    this.setAttribute("vm-scope", this.config.component.constructor.name);

    let props = this.getAttributeNames()
      .filter((f) => f.substr(0, 1) == "[" && f.substr(f.length - 1, 1) == "]")
      .map((f) => f.substr(1, f.length - 2));

    let getParent = (node) => {
      if (!node.parentElement) return node;
      return getParent(node.parentElement);
    };

    var parent = getParent(this);
    if (!this.config.props) {
      this.config.props = {};
    }
    for (let i = 0; i < props.length; i++) {
      var id = parent.getAttribute("class").substr(12);
      eval(
        `this.config.props[props[i]]=window.__global[id].${this.getAttribute(
          "[" + props[i] + "]"
        )};`
      );
    }

    this.config.dom = this.attachShadow({ mode: "open" });
    let ret = await this.render();
    this.config.dom.innerHTML = ret.html;

    let self = this;
    setTimeout(() => {
      Array.isArray(ret.emits) && ret.emits.map((f) => {
        let html = self.shadowRoot.innerHTML.toString();
        let index = html.indexOf(f);
        let endIndex = html.indexOf(`>`, index);
        let startIndex = html.lastIndexOf(`<`, index);
        html = html.substr(startIndex, endIndex - startIndex + 1);
        let eventName = f.split("></")[0].split("}")[0].substr(1);
        let fnName = f.split("></")[0].split('"')[1];
        let id = html.match(/vm-id(.*?)=(.*?)"(.*?)"/g)[0].split('"')[1];
        window.__global[id].emits[eventName] =
        window.__global[this.config.component.id].methods[fnName];
      });
    }, 100);

    window.__global[this.config.component.id].render = async () => {
      let els = [...document.querySelectorAll(this.config.name)];
      for (let i = 0; i < els.length; i++) {
        let el = els[i].shadowRoot.querySelector(
          ".div-element-" + this.config.component.id
        );
        if (el) {
          var text = await this.render();
          el.innerHTML = text;
        }
      }
    };

    this.config.component.onload(this.config.dom);
  }
}
