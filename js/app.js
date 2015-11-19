'use strict';

//Create the module
var app = angular.module('slotmachine', []);

//Add a controller
app.controller('SlotsCtrl', ['$scope', '$timeout', '$interval', 'Reel', function($scope, $timeout, $interval, Reel) {
        
    //Setup scope variables    
    $scope.reelCount = 3;
    $scope.reels = [];
    $scope.doneCount = 0;
    $scope.spinning = false;
    $scope.strings = [
      "You Lose",
      "Winner!"
    ];
    $scope.resultText = "";
    
    //Initialize the controller
    $scope.init = function(reelCount) {
        $scope.reelCount = reelCount;
        //Delay determines when each reel starts
        var delay = 0;
        for(var i = 0; i < $scope.reelCount; i++) {
            //Initialize each reel, and save it in the scope
            $scope.reels[i] = new Reel($("#reel" + i), delay, $scope.done);
            delay += 1000; //Stagger the start time for each reel
        }
    };
    
    //Start spinning, if we aren't already
    $scope.spin = function() {
        if(!$scope.spinning) {
            $scope.spinning = true;
            $scope.resultText = "";
            //Call the start() function for each reel
            for(var i = 0; i < $scope.reels.length; i++) {
                $scope.reels[i].start();
            }
        }  
    };
    
    //This is a callback passed to each reel, keeps track
    //of how many reels have stopped.
    $scope.done = function() {
      $scope.doneCount++;
      //When all reels have stopped, figure out the result
      if($scope.doneCount === $scope.reelCount) {
          $scope.processResult();
      }
    };
    
    //Determine the result of the spin (win or lose) based on
    //the ending position of each reel. If they're all at the
    //same position, it's a win, otherwise, a loss.
    $scope.processResult = function(){
        var winningSpin = true;
        var spinResult = $scope.reels[0].getEndState();
        for(var i = 1; i < $scope.reelCount; i++) {
            winningSpin = winningSpin && (spinResult === $scope.reels[i].getEndState());            
        }
        $scope.displayResult(winningSpin ? 1 : 0);
        $scope.spinning = false;
        $scope.doneCount = 0;
    };
        
    //Update the result text, and flash it a few times.
    $scope.displayResult = function(result) {
        $scope.resultText = $scope.strings[result];
        var blink = $interval($scope.blinker, 400);
        $timeout(function() {
            $interval.cancel(blink);
        }, 1200);
    };
    
    $scope.blinker = function() {
        $('#result').fadeOut(400);
        $('#result').fadeIn(400);
    };

}]);

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

