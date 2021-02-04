gameOver = false
clickValue = 1 // Amount of kills/exp per click
clickValueMult = 1 // Multiplier for clickValue
EXP_RATE = 100 // Multiplier for exp growth rate
EXP_PASSIVE_RATE = 0.01 // Passive gain rate of exp
WIFE_SAP_RATE = 0.005 // Rate at which the wife drains your funds
KILLSTREAK_SAP_RATE = 0.05 // Rate at which kill streak drops
NUISANCE_ADD_RATE = 10 // Amount of gauge added to nuisance per click
GAMER_COST_GROWTH = 1.25 // Growth rate of gamer cost
LOOTBOX_COST_GROWTH = 6
GUN_COST_GROWTH = 1.5
GAMER_BOOST = 1 // Boost to clickValue per gamer
GUN_BOOST = .15 // Boost to clickValueMult per gun
MAX_MESSAGES = 7

messages = ["Keep clicking to keep the streak alive!"]

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

// TODO: Determine more upgrades and costs
// IDEA: Upgrade gun to improve clickValueMult (maybe they can stack?)
// Hire party members to increase clickValue by fixed amount
// M16: clickValue *= 3 (cuz 3 round burst lul)
// AK: clickValue *= 5
// Noobtube: clickValue *= 10

// IDEA: Killstreaks unlock after max kill streak threshold
// The higher the player's max kill streak, the more kill streaks they have access to
// and can activate either sequentially or simultaneously
// Might want to balance with a faster ticks_till_reset time as maxKillStreak increases
// Give the better kill streaks longer cooldown
// Harrier: Increase streak by 5 per tick for 5s-ish
// Pavelow: Increase streak by 7 per tick for 10s-ish (maybe the harrier is upgraded to a pavelow via a shop upgrade or maybe they can stack)
// Counter UAV: Stop nuisances from increasing for a set time
// EMP: Can be longer duration version of counter UAV (again, maybe an upgrade or maybe can be stacked)

tickRate = 16 // milliseconds
timer = 0
DRAW_RATE = 64 // Rate at which text on screen is updated
ticks_till_reset = 3000 / tickRate // Ticks until the killStreak is reset (shorten as maxKillStreak increases?)
resetKillStreak = ticks_till_reset

function addMessage(m) {
  if (messages.length == MAX_MESSAGES)
    messages.shift()
  messages.push(m)
}

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

class Nuisance {

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

function babyIsEmpty() {
  // Ends the game
  if (baby.currentGauge == 0 && !gameOver) {
    gameOver = true
    // Draw game over screen
    var element = document.getElementById("game-screen")
    element.innerHTML = 
      "<div id=\"game-over\"><strong>The baby died.</strong><br>Your life is over<br>High Score: " + resources["maxKillStreak"].toFixed(0) + "</div>"
    element = document.getElementById("game-over")
    element.classList.add("white-box")
    element.classList.add("center")
    element.classList.add("one-col")
  }
}

function wifeIsEmpty() {
  if (wife.currentGauge == 0) {
    resources["experience"] -= resources["experience"] * WIFE_SAP_RATE
  }
}

function pottyIsEmpty() {
  // Disables click
  if (potty.currentGauge == 0) {
    clicker.canClick = false
  } else {
    clicker.canClick = true
  }
}

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
let wife = new Nuisance("wife",0.05,100,5000,60000)
let potty = new Nuisance("potty",0.07,100,100,100000)
let baby = new Nuisance("baby",0.04,100,10000,33000)

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
      numGamers = 10
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

function updateText() {
  // Update resources
  for (var key in resources) {
    let element = document.getElementById(key)
    element.innerHTML = resources[key].toFixed(0)
  }
  // Update kills per click
  document.getElementById("kpc").innerHTML = (clickValue * clickValueMult).toFixed(0)
  // Update exp per click
  document.getElementById("exp-pc").innerHTML = (clickValue * clickValueMult * EXP_RATE).toFixed(0)
  // Update exp per second
  document.getElementById("exp-ps").innerHTML = ((clickValue - 1) * clickValueMult * EXP_RATE * EXP_PASSIVE_RATE * (1000 / tickRate)).toFixed(0)
  // Update nuisance values
  if (potty.isActive)
    document.getElementById("potty").innerHTML = potty.currentGauge.toFixed(0)
  if (wife.isActive)
    document.getElementById("wife").innerHTML = wife.currentGauge.toFixed(0)
  if (baby.isActive)
    document.getElementById("baby").innerHTML = baby.currentGauge.toFixed(0)
  // Update costs
  document.getElementById("upgradeGunCost").innerHTML = costs["upgradeGun"].toFixed(0)
  document.getElementById("lootBoxCost").innerHTML = costs["lootBox"].toFixed(0)
  document.getElementById("gamerCost").innerHTML = costs["gamer"].toFixed(0)
  // Update messages
  let s = "Messages:"
  for (i = 0; i < messages.length; ++i) {
    s += "<br>" + messages[i]
  }
  document.getElementById("messages").innerHTML = s
}

var snd = new Audio("sounds/hitmarker.mp3")
var fart = new Audio("sounds/fart.mp3")
var reload = new Audio("sounds/reload.mp3")
snd.volume = 0.10
fart.volume = 0.25
reload.volume = 0.50

var wifeSnd = new Audio("sounds/wife.mp3")
var babySnd = new Audio("sounds/baby.mp3")
var pottySnd = new Audio("sounds/potty.mp3")

wifeSnd.volume = 0.25;
babySnd.volume = 0.25;
pottySnd.volume = 0.25;

var gamerSnd = new Audio("sounds/gamer.mp3")
var lootBoxSnd = new Audio("sounds/lootbox.mp3")
gamerSnd.volume = 0.25
lootBoxSnd.volume = 0.25

document.addEventListener("DOMContentLoaded", function() {

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
      addMessage("You have upgraded your gun.")
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
      timer += tickRate
      if (resetKillStreak <= 0 && resources["killStreak"] > 0) {
        resetKillStreak = 0
        resources["killStreak"] -= resources["killStreak"] * KILLSTREAK_SAP_RATE

        if (resources["killStreak"] < 0) {
          resources["killStreak"] = 0
        }
      }
      // Determine when to lock or unlock nuisances based on kill streak
      if (!potty.isActive && resources["maxKillStreak"] >= potty.killStreakNeeded && resources["maxKillStreak"] < potty.endKillStreak) {
        potty.isActive = true
        addMessage("<strong>Duty is calling! Don't forget to potty.</strong>")
      }
      if (!wife.isActive && resources["maxKillStreak"] >= wife.killStreakNeeded && resources["maxKillStreak"] < wife.endKillStreak) {
        wife.isActive = true
        addMessage("<strong>Your wife is home. Look busy!</strong>")
      }
      if (!baby.isActive && resources["maxKillStreak"] >= baby.killStreakNeeded && resources["maxKillStreak"] < baby.endKillStreak) {
        baby.isActive = true
        addMessage("<strong>Your son is born. Remember to take care of him!</strong>")
      }
      // Tick everything
      if (potty.isActive) {
        let emptied = potty.tick()
        if (emptied)
          addMessage("<strong>Your bladder is about to explode!</strong>")
        pottyIsEmpty()
      }
      if (wife.isActive) {
        let emptied = wife.tick()
        if (emptied)
          addMessage("<strong>Your wife looks mad. Is she...unplugging your console?!</strong>")
        wifeIsEmpty()
      }
      if (baby.isActive) {
        let emptied = baby.tick()
        babyIsEmpty()
      }
      if (timer > DRAW_RATE) {
        timer -= DRAW_RATE
        updateText()
      }
    }
  }, tickRate)
})