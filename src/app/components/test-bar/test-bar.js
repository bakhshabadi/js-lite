import {Element} from "../../@core/shadow-dom";

@Element({
  selector: "test-bar",
  templateUrl: "./test-bar.htm",
  styleUrl: "./test-bar.scss",
})
class TestBarComponents {
  constructor() {
    this.emits={
      click1:null,
    }
    this.props={};
    this.scope = {
      filter: {
        name: "test-akbar",
        family: "bkh",
      },
      sum: () => "QWE",
    };
  }

  onload(dom) {}

  sendData(self) {
    self.emits.click1(self.scope.filter.name,"AD");
  }
}
