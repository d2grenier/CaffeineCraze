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
