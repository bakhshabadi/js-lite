import {Element} from "../../@core/shadow-dom";

@Element({
  selector: "nav-bar",
  templateUrl: "./nav-bar.htm",
  styleUrl: "./nav-bar.scss",
})
class NavBarComponents {
  constructor() {
    this.scope = {
      filter: {
        name: "jvd",
        family: "bkh",
        description:"this is a test",
      },
      sum: () => "QWE",
    };
  }

  onload(dom) {}

  testButton(str, str1) {
    debugger;
  }

  changeName(self) {
    debugger
    self.setState(self, "scope.filter.family", "WEWE");
  }
}
