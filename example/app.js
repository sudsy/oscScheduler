var ShowScheduler = require("../index"); //Replace this with var ShowScheduler = require("oscscheduler");

//Load Show File
var show = require("./show.json");


//set up show
var thisSchedule = new ShowScheduler(show);


var pixelController; 

thisSchedule.on("beforeStart", function(){
 	//If there are things that need be done before the show starts
	//Start up PixelController
	//Start up the two processing sketches
	
})



thisSchedule.on("afterEnd", function(){
	
	//If there are things that need tidying up after the show is done, do them here
	//Shut down the pixel controller and the sketches

})

var currentTime = new Date();
currentTime.setHours(19, 59, 55, 0)
//Schedule the show to start
thisSchedule.activate(currentTime);