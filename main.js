clickValue = 1
resources = new Map()
resources["experience"] = 0
resources["killStreak"] = 0

tickRate = 16 // milliseconds
timer = 0
DRAW_RATE = 128
TICKS_TILL_RESET = 300 / tickRate // Ticks until the killStreak is reset
resetKillStreak = TICKS_TILL_RESET

var snd = new Audio("sounds/hitmarker.mp3");
snd.volume = 0.25;

class Nuisance {

  isActive = false

  constructor(name, tickAmount, gaugeMax, experienceNeeded) {
    //tickAmount can be the amount of "gauge" lost per tick
    this.name = name
    this.tickAmount = tickAmount
    this.gaugeMax = gaugeMax
    this.experienceNeeded = experienceNeeded
    this.currentGauge = gaugeMax
  }

  tick() {
    this.currentGauge -= this.tickAmount
  }

  addToGauge(amount) {
    this.currentGauge += amount
  }

  isEmpty() {
    return this.currentGauge == 0
  }

}

function babyIsEmpty()
{
  //Ends the game
}

function wifeIsEmpty()
{
  //Decrease experience
}

function pottyIsEmpty()
{
  //disables click
}

let wife = new Nuisance("wife",1,100,200)
let potty = new Nuisance("potty",1,100,200)
let baby = new Nuisance("baby",1,100,200)

class Clicker { // The main clicker object

  constructor(expTick) {
    this.expTick = expTick
    this.canClick = true;
  }

  tick() {
    if (this.canClick) {
      resources["experience"] += this.expTick
      ++resources["killStreak"]
      resetKillStreak = TICKS_TILL_RESET
    }
  }
}

function updateText() {
  // TODO: Update kill streak, experience, and nuisance counts
  for (var key in resources) {
    let element = document.getElementById(key)
    element.innerHTML = resources[key]
  }  
}

document.addEventListener("DOMContentLoaded", function() {
  var clicker = new Clicker(clickValue)

  document.getElementById("clicker").onclick = function() {
    snd.currentTime = 0
    snd.play()
    clicker.tick()
  }

  window.setInterval(function(){ // Clock function
    --resetKillStreak
    timer += tickRate
    if (resetKillStreak <= 0) {
      resetKillStreak = 0
      resources["killStreak"] = 0
    }
    // Tick everything
    if (potty.isActive)
      potty.tick()
    if (wife.isActive)
      wife.tick()
    if (baby.isActive)
      baby.tick()
    // TODO: Determine when to unlock nuisances based on exp
    if (timer > DRAW_RATE) {
      timer -= DRAW_RATE
      updateText()
    }
  }, tickRate)
})



// ---
// Professor's code
// ---
// var timer = 256
// var tickRate = 16
// var visualRate = 256
// var resources = {"gold":0,"pickaxe":1}
// var costs = {"pickaxe":15,
// 	     "miner":200,
// 	     "miner_pickaxe":15}
// var growthRate = {"pickaxe":1.25,
// 		  "miner":1.25,
// 	     "miner_pickaxe":1.75}

// var increments = [{"input":["miner","miner_pickaxe"],
// 		   "output":"gold"}]

// var unlocks = {"pickaxe":{"gold":10},
// 	       "miner":{"gold":100},
// 	       "miner_pickaxe":{"miner":1}}

// function mineGold(num){
//     resources["gold"] += num*resources["pickaxe"]
//     updateText()
// };

// function upgradeMinerPickaxe(num){
//     if (resources["gold"] >= costs["miner_pickaxe"]*num){
// 	resources["miner_pickaxe"] += num
// 	resources["gold"] -= num*costs["miner_pickaxe"]
	
// 	costs["miner_pickaxe"] *= growthRate["miner_pickaxe"]
	
// 	updateText()
//     }
// };

// function upgradePickaxe(num){
//     if (resources["gold"] >= costs["pickaxe"]*num){
// 	resources["pickaxe"] += num
// 	resources["gold"] -= num*costs["pickaxe"]
	
// 	costs["pickaxe"] *= growthRate["pickaxe"]
	
// 	updateText()
//     }
// };
// function hireMiner(num){
//     if (resources["gold"] >= costs["miner"]*num){
// 	if (!resources["miner"]){
// 	    resources["miner"] = 0
// 	}
// 	if (!resources["miner_pickaxe"]){
// 	    resources["miner_pickaxe"] = 1
// 	}
// 	resources["miner"] += num
// 	resources["gold"] -= num*costs["miner"]
	
// 	costs["miner"] *= growthRate["miner"]
	
// 	updateText()

	
//     }
// };



// function updateText(){
//     for (var key in unlocks){
// 	var unlocked = true
// 	for (var criterion in unlocks[key]){
// 	    unlocked = unlocked && resources[criterion] >= unlocks[key][criterion]
// 	}
// 	if (unlocked){
// 	    for (var element of document.getElementsByClassName("show_"+key)){		
// 		element.style.display = "block"
// 	    }
// 	}
//     }
    
//     for (var key in resources){
// 	 for (var element of document.getElementsByClassName(key)){
// 	    element.innerHTML = resources[key].toFixed(2)
// 	}
//     }
//     for (var key in costs){
// 	for (var element of document.getElementsByClassName(key+"_cost")){
// 	    element.innerHTML = costs[key].toFixed(2)
// 	}
//     }
// };


// window.setInterval(function(){
//     timer += tickRate

    
//     for (var increment of increments){
// 	total = 1
// 	for (var input of increment["input"]){
// 	    total *= resources[input]
	    
// 	}
// 	if (total){
// 	    console.log(total)
// 	    resources[increment["output"]] += total/tickRate
// 	}
//     }
    
//     if (timer > visualRate){
// 	timer -= visualRate
// 	updateText()
//     }
  

// }, tickRate);