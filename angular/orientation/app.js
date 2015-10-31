(function() {
  var app = angular.module('whatever', []);

  app.directive("deviceOrientation", function($window) {
    return { 
      "restrict": "E",
      "controllerAs": "orientation",
      "templateUrl": "orientation.html",
      "controller": [ "$window", "$scope", function($window, $scope) {
        this.supported = function() {
          return $window.DeviceOrientationEvent;
        };
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        this.lastEvent = Date.now();

        this.setOrientation = function(e) {
          console.log({ setOrientation: e })
          this.alpha = e.alpha;
          this.beta = e.beta;
          this.gamma = e.gamma;
          this.lastEvent = Date.now();

          // Update the DOM with our changes
          $scope.$apply();
        };
        
        this.color = function() {
          console.log({"now": this})
          return "rgb(" +
            Math.floor((this.alpha / 360.0) * 255.0 + 255) % 255 + "," +
            Math.floor((this.beta / 360.0) * 255.0 + 255) % 255+ "," +
            Math.floor((this.gamma / 360.0) * 255.0 + 255) % 255+ ")";
        };

        var self = this;
        if (this.supported) {
          $window.addEventListener("deviceorientation", function(e) {
            self.setOrientation(e);
          }, true);
        } else { // make something up
          setInterval(function() {
            self.setOrientation({ alpha: Math.random() *360, beta: Math.random() * 360, gamma: Math.random() * 360})
          }, 1000);
        }
      }]
    };
  });

})();

