//Add a factory for the individual reels in the game
app.factory('Reel', ['$timeout', '$interval', function($timeout, $interval) {

    //Every reel has to follow some basic rules regarding
    //speed and how long the remain at a certain speed
    var maxSpeed = 100;
    var minSpeed = 5;
    var minTimeout = 100;
    var maxTimeout = 3000;

    //Constructor for the Reel object
    function Reel(element, delay, callback) {
        this.element = element;
        this.delay = delay;
        this.intervalVar = null;
        this.speed = 5;
        this.findStop = false;
        this.spinning = false;
        this.speedStep = 5;
        this.callback = callback;
    };

    Reel.prototype = {

        //Determine whether the reel is spinning
        isSpinning: function() {
          return this.spinning;
        },

        //Start the reel spinning
        start: function() {
            this.spinning = true;
            var that1 = this;
            //After the initial delay, all the spin() function
            //at a random time interval
            $timeout(function() {
                var that2 = that1;
                var intervalTime = Math.floor((Math.random() * 50) + 25);
                that1.intervalVar = $interval(function() {
                    that2.spin();
                }, intervalTime);
            }, that1.delay);
            //Trigger the speed increase after 3 seconds
            $timeout(function(){
                that1.increase(3000);
            }, 3000);
        },

        //Simulate a spinning reel by changing the position of the background image
        spin: function() {
            var backgroundPos = this.element.css("backgroundPosition").split(" ");
            var currY = parseInt(backgroundPos[1]);
            //If we are at the slow end of the spin and at a good stopping point,
            //call the stop function
            if(this.findStop && currY % 200 === 0) {
                this.stop();
            } else { //Otherwise, update the background position
                //Normalize the background position so it doesn't
                //grow to infinity
                var newY = (currY + this.speed) % 600;
                this.element.css("backgroundPosition", backgroundPos[0] + ' ' + newY + 'px');
            }
        },

        //Increase the speed of the reel.
        increase: function(timeout) {
            var that = this;
            //Only increase until we reach max speed
            if(this.speed < maxSpeed) {
                this.speed += this.speedStep;
                //Make sure we don't increase the speed too quickly
                var newTimeout = Math.max(minTimeout, timeout/2);
                $timeout(function(){
                    that.increase(newTimeout);
                }, newTimeout);
            } else {
                //If we've reached the max speed, stay there for 3 seconds,
                //then start to decrease
                $timeout(function(){
                    that.decrease(timeout);
                }, 3000);
            }
        },

        //Decrease the speed of the reel.
        decrease: function(timeout) {
            var that = this;
            //Keep decreasing speed until we reach the minimum
            if(this.speed > minSpeed) {
                this.speed -= this.speedStep;
                var newTimeout = (this.speed < 30) ? Math.min(timeout * 2, maxTimeout) : 100;
                $timeout(function(){
                   that.decrease(newTimeout);
                }, newTimeout);
            } else {
                //Once we're at the minimum speed, set the findStop
                //variable so we can find a good stopping point.
                this.findStop = true;
            }
        },

        //The reel has stopped spinning. Cancel the interval we set up
        //in the start method, and reset variables for the next spin.
        stop: function() {
            $interval.cancel(this.intervalVar);
            this.speed = 5;
            this.findStop = false;
            this.spinning = false;
            this.callback();
        },

        //Get the Y background position fot the reel so we can figure
        //out the result
        getEndState: function() {
            var backgroundPos = this.element.css("backgroundPosition").split(" ");
            var currY = parseInt(backgroundPos[1]);
            return currY % 600;
        }
    };

    return Reel;
}]);
