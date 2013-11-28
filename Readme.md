`oscscheduler` works by reading a schedule file written in json. This file specifies a start time and end time for the show which will be run each day. 

The show itself is a series of osc actions that will be run in a loop until then end time.

'Usage'
```javascript
var ShowScheduler = require("oscscheduler");

//Load Show File
var show = require("./show.json");  // The Show File to Load - More details below


//set up show
var thisSchedule = new ShowScheduler(show);



thisSchedule.on("beforeStart", function(){
 	//If there are things that need be done before the show starts
	
})



thisSchedule.on("afterEnd", function(){
	

})

var currentTime = new Date();
currentTime.setHours(19, 59, 55, 0)
//Schedule the show to start - Optionally pass the current time for testing purposes

//This line schedules the show to start
thisSchedule.activate(currentTime);
```
`Format for Show File' - Comments are Not Allowed in Real JSON File
show.json
```json
{
	"servers" : { //One or more Servers
		"Server1" : {
			"Host" : "127.0.0.1",
			"Port" : 9876
		}
	},
	"startTime": "20:00", //Time to start the show
	"endTime": "20:01", //Time to end the show
	"schedule" : [ // The groups of commands to run when they have finished they will just loop
		{"duration": 10, "commands": [ //duration is how long you want the effect to last till the next one
			{"server": "Server1", "action": "/CURRENT_VISUAL", "parameters": [{"i":0}] }, //Parameters is an array of typed parameters example [{"i":1}, {"s":"some string"}]
			{"server": "Server1", "action": "/CHANGE_GENERATOR_A", "parameters": [{"i":4}]},
			{"server": "Server1", "action": "/CHANGE_ALL_OUTPUT_VISUAL", "parameters": [{"i":0}]}
		]},
		{"duration": 20, "commands": [
			{"server": "Server1", "action": "/CURRENT_VISUAL", "parameters": [{"i":1}]},
			{"server": "Server1", "action": "/CHANGE_GENERATOR_A", "parameters": [{"i":2}]},
			{"server": "Server1", "action": "/CHANGE_ALL_OUTPUT_VISUAL", "parameters": [{"i":1}]}
		]}
	],
	"onShowEnd" : {"commands":[ //This runs at the end Time to clean up the show
		{"server": "Server1", "action": "/CURRENT_VISUAL", "parameters": [{"i":0}]},
		{"server": "Server1", "action": "/CHANGE_GENERATOR_A", "parameters": [{"i":0}]},
		{"server": "Server1", "action": "/CURRENT_COLORSET", "parameters": [{"i":1}]},
		{"server": "Server1", "action": "/CHANGE_ALL_OUTPUT_VISUAL", "parameters": [{"i":0}]}
	]}

}
```