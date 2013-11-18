var osc = require('node-osc');
var util = require("util");
var EventEmitter = require("events").EventEmitter;

// var client = new osc.Client('127.0.0.1', 9876); 




function executeAndRepeat(options, callback){
	setTimeout(function(){
		 var interval = setInterval(options.fn, options.repeatEvery);
		 options.fn();
		 // console.log(interval);
		 if(callback) return callback(null, interval);
	}, options.startIn)
}



var ShowScheduler = function ShowScheduler(show){
	EventEmitter.call(this);
	var that = this;
	
	//Set up the UDP Clients  for the Servers specified in the show file
	Object.keys(show.servers).forEach(function(key){
		show.servers[key].Socket = new osc.Client(show.servers[key].Host, show.servers[key].Port); 
	});

	function sendOSCCommands(){
		// console.log(this.commands);
		this.commands.forEach(function(oscCommand){
			show.servers[oscCommand.server].Socket.send(oscCommand.action, oscCommand.parameter)
		})
	}

	function startShow(){
		that.emit("beforeStart");

		
		show.schedule.forEach(function(scheduleItem){
			
			var sendCommands = function(){
				sendOSCCommands.call(scheduleItem);
			}
			executeAndRepeat({startIn: scheduleItem.start * 1000, repeatEvery: show.length * 1000, fn: sendCommands}, function(err, interval){
				// console.log(interval);
				scheduleItem.timer = interval;
			});		
		})
	}

	function endShow(){
		// console.log("End Called")
		show.schedule.forEach(function(scheduleItem){
			// console.log(scheduleItem.timer);
			clearInterval(scheduleItem.timer);
		});
		sendOSCCommands.call(show.onShowEnd);
		that.emit("afterEnd");
	}


	this.activate = function activateShow(currentTime){

		//Allow time to passed in for testing
		currentTime = currentTime || new Date();

		//Set the startTime for today
		var startTime = new Date();
		startTime.setHours(Number(show.startTime.substr(0,2)), Number(show.startTime.substr(3,2)), 0 , 0);
		var endTime = new Date();
		endTime.setHours(Number(show.endTime.substr(0,2)), Number(show.endTime.substr(3,2)), 0 , 0);
		
		var dayInMillisecs = 1000 * 60 * 60 * 24;
		
		
		// 2. startTime has passed but endTime hasn't
		if(currentTime > startTime && currentTime < endTime){
			//Start The Show
			startShow();
		}
		if(currentTime > startTime){
			//Need to adjust the startTime forward by One Day
			startTime = new Date(startTime.getTime() + dayInMillisecs);
		}
		if(currentTime > endTime){
			//Need to adjust the endTime forward by one day
			endTime = new Date(endTime.getTime() + dayInMillisecs);
			// console.log(endTime)
		}
		
		executeAndRepeat({startIn: startTime - currentTime, repeatEvery: dayInMillisecs, fn: startShow});
		executeAndRepeat({startIn: endTime - currentTime, repeatEvery: dayInMillisecs, fn: endShow});
		

	}


}

util.inherits(ShowScheduler, EventEmitter);

module.exports = ShowScheduler;
