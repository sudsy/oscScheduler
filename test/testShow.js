var ShowScheduler = require("../index");
var domain = require("domain");

var should = require("should");


var testShow = {
	"servers" : {
		"testServer" : {
			"Host" : "127.0.0.1",
			"Port" : 9876
		}
	},
	"startTime": "20:00",
	"endTime": "20:01", 
	"schedule" : [
		{"duration": 1, "commands": [
			{"server": "testServer", "action": "/CURRENT_VISUAL", "parameters": [{i:0}]}
		]},
		{"duration": 2, "commands": [
			{"server": "testServer", "action": "/CURRENT_VISUAL", "parameters": [{i:1}]}
		]}
	],
	"onShowEnd" : {"commands":[
		{"server": "testServer", "action": "/CURRENT_VISUAL", "parameter": [{i:0}]}
	]}

}
function TimeoutLogger(){
	var that = this;
	this.setTimeoutMock = function(fn, delay){
		that.timeoutArray.push({fn: fn, delay: delay})
	}
	this.setIntervalMock = function(fn, interval){
		that.intervalArray.push({fn: fn, interval: interval})
	}
	this.timeoutArray = [];
	this.intervalArray = [];
}

var originalSetTimeout = setTimeout;
var originalSetInterval = setInterval;


describe("Basic Show", function(){
	it("Should Schedule a basic show if the current time is before the start", function(done){
		var timeoutLogger = new TimeoutLogger();
		setTimeout = timeoutLogger.setTimeoutMock;
		setInterval = timeoutLogger.setIntervalMock;
		
		var thisSchedule = new ShowScheduler(testShow);
		var currentTime = new Date();
		currentTime.setHours(19, 59, 55, 0)
		//Schedule the show to start
		thisSchedule.activate(currentTime);
		//Should contain a start and an end functon that both should contain areference to setInterval
		timeoutLogger.timeoutArray.should.have.length(2);
		timeoutLogger.intervalArray.should.have.length(0);
		timeoutLogger.timeoutArray[0].delay.should.equal(5000);
		timeoutLogger.timeoutArray[1].delay.should.equal(65000);
		setInterval = originalSetInterval;
		setTimeout = originalSetTimeout;
		done();
	})

	it("Should work if we start in the middle of a show", function(done){
		var timeoutLogger = new TimeoutLogger();
		setTimeout = timeoutLogger.setTimeoutMock;
		setInterval = timeoutLogger.setIntervalMock;
		
		var thisSchedule = new ShowScheduler(testShow);
		var currentTime = new Date();
		currentTime.setHours(20, 00, 01, 0)
		//Schedule the show to start
		thisSchedule.activate(currentTime);
		//Should contain a funtion for each of the scheduled items

		//One for the start of the show tomorrow (We already Started Today)
		
		
		// console.log(timeoutLogger.timeoutArray);
		//There will be 4 items in the array
		//One for the start 
		timeoutLogger.timeoutArray.should.have.length(4);
		timeoutLogger.intervalArray.should.have.length(0);
		timeoutLogger.timeoutArray[0].delay.should.equal(0000); //These are not adjusted for the late start, we always start at the beginning
		timeoutLogger.timeoutArray[1].delay.should.equal(1000);
		timeoutLogger.timeoutArray[2].delay.should.equal(86399000); // 1 second less than a day
		timeoutLogger.timeoutArray[3].delay.should.equal(59000);
		setInterval = originalSetInterval;
		setTimeout = originalSetTimeout;
		done();
	})

	it("Should work if we start just after the show", function(done){
		var timeoutLogger = new TimeoutLogger();
		setTimeout = timeoutLogger.setTimeoutMock;
		setInterval = timeoutLogger.setIntervalMock;
		
		var thisSchedule = new ShowScheduler(testShow);
		var currentTime = new Date();
		currentTime.setHours(20, 01, 01, 0)
		//Schedule the show to start
		thisSchedule.activate(currentTime);
		//Should contain a funtion for each of the scheduled items

		//One for the start of the show tomorrow (We already Started Today)
		
		
		// console.log(timeoutLogger.timeoutArray);
		//There will be 4 items in the array
		//One for the start 
		timeoutLogger.timeoutArray.should.have.length(2);
		timeoutLogger.intervalArray.should.have.length(0);
		timeoutLogger.timeoutArray[0].delay.should.equal(86339000);
		timeoutLogger.timeoutArray[1].delay.should.equal(86399000);
		setInterval = originalSetInterval;
		setTimeout = originalSetTimeout;
		done();
	})
	it("Should set up the intervals if we wait until the setTimouts have fired", function(done){
		var d = domain.create();
		d.on("error", function(err){
			setInterval = originalSetInterval;
			setTimeout = originalSetTimeout;
			return done(err);
		})
		this.timeout(20000);
		var timeoutLogger = new TimeoutLogger();
		setInterval = timeoutLogger.setIntervalMock;
		
		var thisSchedule = new ShowScheduler(testShow);
		var currentTime = new Date();
		currentTime.setHours(20, 00, 01, 0)
		//Schedule the show to start
		thisSchedule.activate(currentTime);
		//Should contain a funtion for each of the scheduled items

		//One for the start of the show tomorrow (We already Started Today)
		
		setTimeout(function(){
			d.enter();
			// console.log(timeoutLogger.timeoutArray);
			// console.log(timeoutLogger.intervalArray);
			// timeoutLogger.timeoutArray.should.have.length(2);
			timeoutLogger.intervalArray.should.have.length(2);
			timeoutLogger.intervalArray[0].interval.should.equal(3000); //Both of these will repat every 3 seconds, just at different times
			timeoutLogger.intervalArray[1].interval.should.equal(3000);
			setInterval = originalSetInterval;
			setTimeout = originalSetTimeout;
			done();
			d.exit();
		},3000)
		
		//There will be 4 items in the array
		//One for the start 
		
	})
})