function pageOffset(el, c) {
  var parent;
  if (parent = el.parentElement) {
    if (c) {
      c.x += el.offsetLeft
      c.y += el.offsetTop
      return pageOffset(parent, c);
    }
    return pageOffset(parent, { x: el.offsetLeft, y: el.offsetTop });
  } 
  return c;
}

function computeHorizontalBounds(context, inner_selector) {
  return {
    // left-most pixel
    lower: context.offset().left + parseInt(context.css("padding-left")),
    // right-most pixel if the joystick is all the way right; the left side of the joystick.
    upper: context.offset().left + context.innerWidth() - parseInt(context.css("padding-right")) - $(inner_selector, context).outerWidth(),
  };
}

function computeVerticalBounds(context, inner_selector) {
  return {
    // top-most pixel
    lower: context.offset().top + parseInt(context.css("padding-top")),
    // bottom-most pixel if the joystick is all the way bottom; the top side of the joystick.
    upper: context.offset().top + context.innerHeight() - parseInt(context.css("padding-bottom")) - $(inner_selector, context).outerHeight(),
  };
}

// TODO(sissel): MVC this? Model is position, View is the HTML, Controller maps between 
var Slider = React.createClass({
  getInitialState: function () {
    return { 
      ratio: 0,
    };
  },

  componentDidMount: function() {
    this.dom = $(React.findDOMNode(this));
    this.bounds = computeHorizontalBounds(this.dom, ".joystick");
    this.dom.addClass(this.props.className)
    this.setPosition(this.bounds.upper / 2);
  },

  stopDrag: function (el, pointer_type) {
    $(el).css("transition", "left 0.3s cubic-bezier(.72,1.43,.76,1.01)")
    this.setPosition(this.bounds.upper / 2);

    if (pointer_type == "mouse") {
      document.removeEventListener('mousemove', this.drag_move, true);
      document.removeEventListener('mouseup', this.drag_release, true);
    } else {
      document.removeEventListener('touchmove', this.drag_move, true);
      document.removeEventListener('touchend', this.drag_release, true);
    }
    delete this.drag_move
    delete this.drag_release
  },

  startMouseDrag: function(e) {
    this.startDrag(e, "mouse");
  },

  startTouchDrag: function(e) {
    this.startDrag(e, "touch");
  },

  startDrag: function(e, pointer_type) {
    var x;
    console.log(e);
    if (e.type == "mousedown") {
      if (e.button != 0) { return; }
      //this.setState({ debug: "Mouse" });
      x = e.pageX;
    } else { // TouchStart Event
      //this.setState({ debug: "touch: " + e.targetTouches[0].pageX });
      x = e.targetTouches[0].pageX;
    }
    e.preventDefault();

    var el = $(e.target);
    el.css("transition", "none");
    var self = this; // lol javascript

    // Compute the offset of this element relative to its parent
    // Also include the relative position of the pointercompared
    // to the upper-left corner of the target element.
    // This will keep the pointer locked on the original pixel
    // that we started dragging on.
    var parent = el.parent();
    var offset = parent.offset().left;
    offset += parseInt(parent.css("padding-left")) + (x - el.offset().left);
    //alert(x);
    offset -= this.bounds.lower

    this.slider_middle = (this.bounds.upper) / 2;

    this.drag_move = function(e) {
      var x;
      if ("TouchEvent" in window && e instanceof TouchEvent) { // mobile
        x = e.targetTouches[0].pageX; 
      } else { 
        x = e.pageX;
      }

      var left = x - offset;
      // 'left' at this point is normalized to have 0 mean the left-most point
      // in the range.
      if (left < 0) {
        left = 0;
      } else if (left > self.bounds.upper) {
        left = self.bounds.upper;
      }
      self.setPosition(left);
    };

    this.drag_release = function(e) {
      self.stopDrag(el, pointer_type);
    };

    if (pointer_type == "mouse") {
      document.addEventListener('mousemove', this.drag_move, true);
      document.addEventListener('mouseup', this.drag_release, true);
    } else {
      // touchmove events can be on the element itself instead of the
      // whole document. This lets us have multiple fingers down at the
      // same time interacting with different elements.
      el.get(0).addEventListener('touchmove', this.drag_move, true);
      el.get(0).addEventListener('touchend', this.drag_release, true);
    }
  },

  setPosition: function(value) {
    this.setState({ 
      ratio: 1 / (this.bounds.upper / value),
      style: { left: value }
    });
  },

  render: function () {
    return <div className="joystick-chassis">
        <div>{this.state.debug}</div>
        <div className="joystick" onMouseDown={this.startMouseDrag} onTouchStart={this.startTouchDrag} style={this.state.style}>
          {Math.floor(100 * this.state.ratio)}%
        </div>
      </div>;
  }
});

React.render( <div><Slider className="one"/><Slider className="two"/><Slider className="three"/></div> , document.getElementById("container"));
