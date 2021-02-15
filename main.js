gameOver = false
clickValue = 1 // Amount of kills/exp per click
clickValueMult = 1 // Multiplier for clickValue
EXP_RATE = 100 // Multiplier for exp growth rate
EXP_PASSIVE_RATE = 0.01 // Passive gain rate of exp
WIFE_SAP_RATE = 0.005 // Rate at which the wife drains your funds
KILLSTREAK_SAP_RATE = 0.05 // Rate at which kill streak drops
NUISANCE_ADD_RATE = 10 // Amount of gauge added to nuisance per click
GAMER_COST_GROWTH = 1.25
LOOTBOX_COST_GROWTH = 6
GUN_COST_GROWTH = 1.5
GAMER_BOOST = 1 // Boost to clickValue per gamer
GUN_BOOST = .15 // Boost to clickValueMult per gun
MAX_MESSAGES = 7 // Max number of messages stored in message box
POTTY_UNLOCK = 100 // Kill streak potty unlocks at
WIFE_UNLOCK = 500 // Kill streak wife unlocks at
BABY_UNLOCK = 1500 // Kill streak baby unlocks at
PROGRESS_EXP_INC = 100 // Increase in EXP rate as player progresses
DOOMER_IMG = "imgs/doomer.jpg"

bg = [
"mlg.gif",
"dorito-gunner.gif", 
"banana.gif",
"background.jpg",
"arthur.gif",
"dew.gif",
"dorito.gif",
"cod.gif",
"door.gif",
"knife.gif",
"pikachu.gif",
"teammates.gif"]

bgIndex = 0 // Index of the current background image being displayed

messages = ["<strong>Keep clicking to keep the streak alive!</strong>"]
progressButtonText = ["Child Protective Services<br>", "Get a Divorce<br>", "Wear Diapers<br>", "Ascend Higher<br>"]
progressIndex = 0
progressCost = [20000, 50000, 100000, 150000] // Kill streak needed to get rid of baby, wife, potty, and win respectively

resources = new Map() // Amount of resources the player has
resources["experience"] = 0
resources["killStreak"] = 0
resources["maxKillStreak"] = 0
resources["gamer"] = 0

costs = new Map() // Cost of upgrades
costs["gamer"] = 5000
costs["lootBox"] = 1000
costs["upgradeGun"] = 20000
reqMaxStreak = new Map() // Required max kill streak for certain upgrades

tickRate = 16 // milliseconds
timer = 0
DRAW_RATE = 64 // Rate at which text on screen is updated
ticks_till_reset = 3000 / tickRate // Ticks until the killStreak is reset (shorten as maxKillStreak increases?)
resetKillStreak = ticks_till_reset

//Function to check for victory
function victory() {
  // Draw victory screen
  var element = document.getElementById("game-screen")
  element.innerHTML = 
    "<div id=\"game-over\"><strong>You have abandoned your body to transcend the mortal realm</strong><br>Legends of your gaming skill will be passed down for generations<br><br>High Score: " + addCommas(resources["maxKillStreak"]) + "</div>"
  element = document.getElementById("game-over")
  element.classList.add("white-box")
  element.classList.add("center")
  element.classList.add("one-col")
}

//Function to check for defeat
function defeat() {
  gameOver = true
  // Draw game over screen
  var element = document.getElementById("game-screen")
  element.innerHTML = 
    "<div id=\"game-over\"><strong>The baby died.</strong><br>Your life is over<br><br>High Score: " + addCommas(resources["maxKillStreak"]) + "</div>"
  element = document.getElementById("game-over")
  element.classList.add("white-box")
  element.classList.add("center")
  element.classList.add("one-col")
}

//Put a message for the user
function addMessage(m) {
  if (messages.length == MAX_MESSAGES)
    messages.shift()
  messages.push(m)
}

function addCommas(n) {
  var num = Math.floor(n)
  if (num == 0)
    return "0"
  var result = ""
  var itr = 0
  while (num > 0) {
    if (itr >= 3 && itr % 3 == 0)
      result = ',' + result
    result = (num % 10).toFixed(0) + result
    ++itr
    num = Math.floor(num / 10)
  }
  return result
}

//Generate a tag for discord user name
function generateDiscordDigitString() {
  return "#" + (Math.floor(Math.random() * 9000) + 1000).toString()
}

class Clicker { // The main clicker object

  constructor() {
    this.canClick = true;
  }

  tick() {
    if (this.canClick) {
      resources["experience"] += clickValue * clickValueMult * EXP_RATE
      resources["killStreak"] += clickValue * clickValueMult
      if (resources["killStreak"] > resources["maxKillStreak"])
        resources["maxKillStreak"] = resources["killStreak"]
      resetKillStreak = ticks_till_reset
    }
  }
}

class Nuisance { //Objects that have to be managed by the user

  constructor(name, tickAmount, gaugeMax, killStreakNeeded, endKillStreak) {
    // tickAmount can be the amount of "gauge" lost per tick
    this.isActive = false
    this.name = name
    this.tickAmount = tickAmount
    this.gaugeMax = gaugeMax
    this.killStreakNeeded = killStreakNeeded
    this.endKillStreak = endKillStreak
    this.currentGauge = gaugeMax
  }

  tick() {
    var pastAmount = this.currentGauge
    this.currentGauge -= this.tickAmount
    if (this.currentGauge < 0)
      this.currentGauge = 0
    // Return true if the gauge has just reached 0
    if (pastAmount != 0 && this.currentGauge == 0)
      return true
    return false
  }

  addToGauge(amount) {
    this.currentGauge += amount
    if (this.currentGauge > this.gaugeMax)
    {
      this.currentGauge = this.gaugeMax;
    }
  }

  isEmpty() {
    return this.currentGauge == 0
  }

}

//Function that checks if the baby is empty and act acoordingly
function babyIsEmpty() {
  // Ends the game
  if (baby.currentGauge == 0 && !gameOver) {
    defeat()
  }
}

//Function to check if the wife is empty and act accordingly
function wifeIsEmpty() {
  if (wife.currentGauge == 0) {
    resources["experience"] -= resources["experience"] * WIFE_SAP_RATE
  }
}

//Function that checks if the potty is empty and act accordingly
function pottyIsEmpty() {
  // Disables click
  if (potty.currentGauge == 0) {
    clicker.canClick = false
  } else {
    clicker.canClick = true
  }
}

//Function to generate bonus for user if they are taking good care of their nuisances
function calculateMultiplier(potty,wife,baby)
{
  maxGauge = 0
  currentGauge = 0
  if (potty.isActive)
  {
    maxGauge += potty.maxGauge
    currentGauge += potty.currentGauge
  }
  if (wife.isActive)
  {
    maxGauge += wife.maxGauge
    currentGauge += wife.currentGauge
  }
  if (baby.isActive)
  {
    maxGauge += baby.maxGauge
    currentGauge += baby.currentGauge
  }

  if (maxGauge == 0)
  {
    return 1
  }

  return 2 * (currentGauge/maxGauge)
}

let clicker = new Clicker()
let wife = new Nuisance("wife",0.05,100,WIFE_UNLOCK,60000)
let potty = new Nuisance("potty",0.07,100,POTTY_UNLOCK,100000)
let baby = new Nuisance("baby",0.04,100,BABY_UNLOCK,33000)

//Function that determines the lootbox result
function activateLootbox(cost)
{
  choice = Math.floor(Math.random() * 3)
  switch(choice)
  {
    case 0:
      addMessage("Woah! That lootBox contained " + (2 * cost).toFixed(0) + " EXP!")
      resources["experience"] += 2 * cost
      break;
    case 1:
      numGamers = 5
      addMessage("The sound of the LootBox has brought " + numGamers + " gamers to your cause!")
      resources["gamer"] += numGamers
      clickValue += GAMER_BOOST * numGamers

      break;
    case 2:
      addMessage("The LootBox upgrades your gun! EPIC!")
      clickValueMult += GUN_BOOST
      break;
    default:
      addMessage("Wow! You get nothing!")
  }
}

//Function to update the text to the user
function updateText() {
  // Update resources
  for (var key in resources) {
    let element = document.getElementById(key)
    element.innerHTML = addCommas(resources[key])
  }
  // Update kill streak reset timer
  document.getElementById("kill-reset").innerHTML = (resetKillStreak * tickRate / 1000).toFixed(0) + "s"
  // Update kills per click
  document.getElementById("kpc").innerHTML = addCommas((clickValue * clickValueMult))
  // Update exp per click
  document.getElementById("exp-pc").innerHTML = addCommas((clickValue * clickValueMult * EXP_RATE))
  // Update exp per second
  document.getElementById("exp-ps").innerHTML = addCommas(((clickValue - 1) * clickValueMult * EXP_RATE * EXP_PASSIVE_RATE * (1000 / tickRate)))
  // Update nuisance values
  // if (potty.isActive)
  //   document.getElementById("potty").innerHTML = potty.currentGauge.toFixed(0)
  // if (wife.isActive)
  //   document.getElementById("wife").innerHTML = wife.currentGauge.toFixed(0)
  // if (baby.isActive)
  //   document.getElementById("baby").innerHTML = baby.currentGauge.toFixed(0)
  // Update costs
  document.getElementById("upgradeGunCost").innerHTML = addCommas(costs["upgradeGun"])
  document.getElementById("lootBoxCost").innerHTML = addCommas(costs["lootBox"])
  document.getElementById("gamerCost").innerHTML = addCommas(costs["gamer"])
  // Update messages
  let s = "<strong>Message Log:</strong>"
  for (i = 0; i < messages.length; ++i) {
    s += "<br>" + messages[i]
  }
  document.getElementById("messages").innerHTML = s
}

//Function to change the color of the button according
//to their need
function changeColor(id, count)
{
  perc = Math.ceil((count / 100) * 100)
  document.getElementById(id).style.backgroundColor = "hsl("+perc+",100%,50%)";
}

//Hitmarker sound to be played on button press
var snd = new Audio("sounds/hitmarker.mp3")
snd.volume = 0.05

//Noise to play when the button cannot be pressed due to potty
var fart = new Audio("sounds/fart.mp3")
fart.volume = 0.25

//Noise to play when gun is upgraded
var reload = new Audio("sounds/reload.mp3")
reload.volume = 0.50

//Noise the wife plays when she is clicked
var wifeSnd = new Audio("sounds/wife.mp3")
wifeSnd.volume = 0.25;

//Noise the baby plays when it is clicked
var babySnd = new Audio("sounds/baby.mp3")
babySnd.volume = 0.25;

//Sound potty plays when it is clicked
var pottySnd = new Audio("sounds/potty.mp3")
pottySnd.volume = 0.25;

//Sound when a gamer is gotten
var gamerSnd = new Audio("sounds/gamer.mp3")
gamerSnd.volume = 0.25

//Sound when a lootbox is open
var lootBoxSnd = new Audio("sounds/lootbox.mp3")
lootBoxSnd.volume = 0.25

document.addEventListener("DOMContentLoaded", function() {
  // Dynamically scale the body
  var scale = Math.min(window.screen.availWidth / 2560, window.screen.availHeight / 1440)
  document.getElementById("game-screen").style.transform = "scale(" + scale + ")"

  // Initiate progress button text
  document.getElementById("progressButton").innerHTML = progressButtonText[progressIndex] + addCommas(progressCost[progressIndex]) + " Max Kill Streak"

  document.getElementById("bgButton").onclick = function() {
    bgIndex = (bgIndex+1) % bg.length
    var img = "url(" + "\"imgs/" + bg[bgIndex] + "\")"
    document.getElementById("game-screen").style.backgroundImage = img
  }


  document.getElementById("progressButton").onclick = function() {
    if (progressIndex == 0 && resources["maxKillStreak"] >= progressCost[0]) {
      lootBoxSnd.currentTime = 0
      lootBoxSnd.play()
      // Get rid of baby
      addMessage("They took the baby.")
      addMessage("You feel your gamer powers grow. (EXP rate increased)")
      EXP_RATE += PROGRESS_EXP_INC
      ++progressIndex
      baby.isActive = false
      document.getElementById("babyButton").style.backgroundColor = "#808080"
      //document.getElementById("baby").innerHTML = "N/A"
      document.getElementById("progressButton").innerHTML = progressButtonText[progressIndex] + addCommas(progressCost[progressIndex]) + " Max Kill Streak"
    }
    else if (progressIndex == 1 && resources["maxKillStreak"] >= progressCost[1]) {
      document.getElementById("game-screen").style.backgroundImage = "url(\"" + DOOMER_IMG + "\")"
      let memeMusic = document.getElementById("meme-music")
      memeMusic.currentTime = 0;
      memeMusic.pause()
      memeMusic.setAttribute('src',"sounds/doomerwave.mp3")
      memeMusic.load();
      memeMusic.play();
      lootBoxSnd.currentTime = 0
      lootBoxSnd.play()
      // Get rid of wife
      addMessage("Your wife left you.")
      addMessage("You feel your gamer powers grow. (EXP rate increased)")
      EXP_RATE += PROGRESS_EXP_INC
      ++progressIndex
      wife.isActive = false
      document.getElementById("wifeButton").style.backgroundColor = "#808080"
      //document.getElementById("wife").innerHTML = "N/A"
      document.getElementById("progressButton").innerHTML = progressButtonText[progressIndex] + addCommas(progressCost[progressIndex]) + " Max Kill Streak"
    }
    else if (progressIndex == 2 && resources["maxKillStreak"] >= progressCost[2]) {
      
      let memeMusic = document.getElementById("meme-music")
      memeMusic.currentTime = 0;
      memeMusic.pause()
      memeMusic.setAttribute('src',"sounds/gymnopedie.mp3")
      memeMusic.load();
      memeMusic.play();
      lootBoxSnd.currentTime = 0
      lootBoxSnd.play()
      // Get rid of potty
      addMessage("Your amazon package arrived.")
      addMessage("You feel your gamer powers grow. (EXP rate increased)")
      EXP_RATE += PROGRESS_EXP_INC
      ++progressIndex
      potty.isActive = false
      document.getElementById("pottyButton").style.backgroundColor = "#808080"
      //document.getElementById("potty").innerHTML = "N/A"
      document.getElementById("progressButton").innerHTML = progressButtonText[progressIndex] + addCommas(progressCost[progressIndex]) + " Max Kill Streak"
    }
    else if (progressIndex == 3 && resources["maxKillStreak"] >= progressCost[3]) {
      lootBoxSnd.currentTime = 0
      lootBoxSnd.play()
      // Win
      gameOver = true
      victory()
    }
    else {
      console.log("Progress index: " + progressIndex.toFixed(0))
      console.log("Max kill streak: " + resources["maxKillStreak"].toFixed(0))
    }
  }

  document.getElementById("clicker").onclick = function() {
      if (clicker.canClick) {
        snd.currentTime = 0
        snd.play()
      } else {
        fart.currentTime = 0
        fart.play()
      }
      clicker.tick()
  }

  document.getElementById("pottyButton").onclick = function() {
    if (potty.isActive) {
      potty.addToGauge(NUISANCE_ADD_RATE)
      pottySnd.currentTime = 0
      pottySnd.play()
    }
  }

  document.getElementById("wifeButton").onclick = function() {
    if (wife.isActive) {
      wife.addToGauge(NUISANCE_ADD_RATE)
      wifeSnd.currentTime = 0
      wifeSnd.play()
    }
  }

  document.getElementById("babyButton").onclick = function() {
    if (baby.isActive) {
      baby.addToGauge(NUISANCE_ADD_RATE)
      babySnd.currentTime = 0
      babySnd.play()
    }
  }

  document.getElementById("upgradeGunButton").onclick = function() {
    if (resources["experience"] >= costs["upgradeGun"]) {
      reload.currentTime = 0
      reload.play()
      addMessage("You have upgraded your gun. (Kill multiplier increased)")
      resources["experience"] -= costs["upgradeGun"]
      costs["upgradeGun"] *= GUN_COST_GROWTH
      clickValueMult += GUN_BOOST
    }
  }

  document.getElementById("gamerButton").onclick = function() {
    if (resources["experience"] >= costs["gamer"]) {
      gamerSnd.currentTime = 0
      gamerSnd.play()
      addMessage("Timmy" + generateDiscordDigitString() + " has entered the call.")
      resources["experience"] -= costs["gamer"]
      costs["gamer"] *= GAMER_COST_GROWTH
      ++resources["gamer"]
      clickValue += GAMER_BOOST
    }
  }
  
  document.getElementById("lootBoxButton").onclick = function() {
    if (resources["experience"] >= costs["lootBox"]) {
      lootBoxSnd.currentTime = 0
      lootBoxSnd.play()
      resources["experience"] -= costs["lootBox"]
      activateLootbox(costs["lootBox"])
      costs["lootBox"] *= LOOTBOX_COST_GROWTH
    }
  }

  window.setInterval(function(){ // Clock function
    if (!gameOver) {
      resources["experience"] += (clickValue - 1) * clickValueMult * EXP_RATE * EXP_PASSIVE_RATE
      --resetKillStreak
      if (resetKillStreak < 0)
        resetKillStreak = 0
      timer += tickRate
      if (resetKillStreak <= 0 && resources["killStreak"] > 0) {
        resetKillStreak = 0
        resources["killStreak"] -= resources["killStreak"] * KILLSTREAK_SAP_RATE

        if (resources["killStreak"] < 0) {
          resources["killStreak"] = 0
        }
      }
      // Determine when to lock or unlock nuisances based on kill streak
      if (!potty.isActive && progressIndex <= 2 && resources["maxKillStreak"] >= potty.killStreakNeeded) {
        potty.isActive = true
        addMessage("<strong>Duty is calling! Don't forget to potty.</strong>")
      }
      if (!wife.isActive && progressIndex <= 1 && resources["maxKillStreak"] >= wife.killStreakNeeded) {
        wife.isActive = true
        addMessage("<strong>Your wife is home. Look busy!</strong>")
      }
      if (!baby.isActive && progressIndex <= 0 && resources["maxKillStreak"] >= baby.killStreakNeeded) {
        baby.isActive = true
        addMessage("<strong>Your son is born. Remember to take care of him!</strong>")
      }
      // Tick everything
      if (potty.isActive) {
        let emptied = potty.tick()
        if (emptied)
          addMessage("<strong>Your bladder is about to explode! [CANNOT CLICK]</strong>")
        pottyIsEmpty()
      }
      if (wife.isActive) {
        let emptied = wife.tick()
        if (emptied)
          addMessage("<strong>Your wife looks mad. Is she...unplugging your console?! [YOU'RE LOSING EXP]</strong>")
        wifeIsEmpty()
      }
      if (baby.isActive) {
        let emptied = baby.tick()
        babyIsEmpty()
      }
      if (timer > DRAW_RATE) {
        timer -= DRAW_RATE
        updateText()
        if (potty.isActive)
          changeColor("pottyButton", potty.currentGauge)
        if (wife.isActive)
          changeColor("wifeButton", wife.currentGauge)
        if (baby.isActive)
          changeColor("babyButton", baby.currentGauge)

      }
    }
  }, tickRate)
})