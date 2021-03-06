﻿#pragma strict

private var mainCTRL : MainCtrl;
private var charCTRL : CharCtrl;
private var scoreCTRL : GUIScore;

var guiLayout : Transform;
var guiHealth : GameObject;
var guiFuel : Transform;
var guiLive : TextMesh;
var guiCrystals : TextMesh;
var guiTimer : TextMesh;
var guiTexter : TextMesh;
var guiTitle : TextMesh;
var guiOver : TextMesh;
var blackScreen : GUITexture;

var credits : TextMesh[];
var healthBars : GameObject[];
public var maxHealth : int;
var healthCount : int;

var startTime : float;
var savedTime : float = 0;
var theTime : float = 0;
var textTimer : String;
var timing : boolean = false;

var gameOver : boolean = false;

var hours : int;
public var minutes : int;
private var seconds : int;

public var fuelMeter : float = 1.0;
private var fuelWaste : float = -0.0001;

public var gameSaved : boolean = false;

function Awake ()
{
	if (mainCTRL == null)
		mainCTRL = GameObject.Find("MainCtrl").GetComponent(MainCtrl);

	if (charCTRL == null)
		charCTRL = GameObject.Find("Character").GetComponent(CharCtrl);

	scoreCTRL = GetComponent(GUIScore);

	//make the gui text show in front of everythig
	guiLive.renderer.sortingLayerID = 7;
	guiCrystals.renderer.sortingLayerID = 7;
	guiTimer.renderer.sortingLayerID = 7;
	guiTexter.renderer.sortingLayerID = 7;
	guiTitle.renderer.sortingLayerID = 7;
	guiOver.renderer.sortingLayerID = 7;

	for(var i : int = 0; i < credits.length; i++)
	{
		var cre : TextMesh = credits[i];
		cre.renderer.sortingLayerID = 7;
	}

	guiOver.renderer.enabled = false;

	iTween.Init(gameObject);

	blackScreen.color.a = 1.0;
	blackScreen.pixelInset = Rect(0, 0, Screen.width, Screen.height);

	guiTexter.color.a = 0;
}

function Start()
{
	CreateHealth();
	ShowGUI(false);
	
	//temp to delete all saves
	//PlayerPrefs.DeleteAll();
	
	
	if(PlayerPrefsX.GetBool("saved"))
	{
		Debug.Log("Loading game");
		gameSaved = PlayerPrefsX.GetBool("saved");
		LoadGame();
	}
	
}

function FixedUpdate ()
{
	if(charCTRL.jetOn)
	{
		if(fuelMeter > 0)
		{
			fuelMeter += fuelWaste;
			guiFuel.localScale = Vector3(fuelMeter, 1, 1);
		}
	}

	if(fuelMeter <= 0 && !gameOver)
	{
		gameOver = true;
		mainCTRL.GameOver();
	}
}

function Update()
{
	if(timing)
	{
		theTime = Time.time + savedTime - startTime;
		hours = Mathf.Floor(theTime / 3600);
		minutes = theTime / 60 -(60 * hours);
		seconds = theTime % 60;

		textTimer = String.Format("{0:0}:{1:00}:{2:00}", hours, minutes, seconds);
		guiTimer.text = textTimer;
	}

}

function TitleScreen()
{
	FadeIn(0);

	//show title
	//ShowCredits(true);

	//show message "press space to start"
	NewText("PRESS 'SPACE' TO START");

	//show Credits

}

function NewGame()
{
	//show normal HUD
	ShowGUI(true);

	//start timer
	startTime = Time.time;
	timing = true;
}

function GameOver()
{
	if(timing)
		timing = false;

	//FadeOut(0.5);
	ShowGUI(false);
	//show game over message
	guiOver.renderer.enabled = true;

	yield WaitForSeconds(3f);
	//show score
	ShowScore();
}

function ShowScore()
{
	scoreCTRL.SetScore();
	PlayerPrefs.DeleteAll();
	NewText("PRESS 'SPACE' TO RESTART");
}

function DeadRespawn()
{
	//press any button to spawn a new clone
	NewText("PRESS ANY KEY TO SPAWN A NEW CLONE");
}


function ChangeLives(newLive: int)
{
	guiLive.text = newLive.ToString();
}

function ChangeCrystals(newCrystal : int)
{
	guiCrystals.text = newCrystal.ToString();
}

function ChangeHealth(newHealth : int)
{
	
	healthCount = newHealth;
	
	for (var i : int = 0; i < healthBars.length; i++)
	{
		var hBar = healthBars[i];
		if(i < newHealth)
			hBar.renderer.enabled = true;
		else
			hBar.renderer.enabled = false;
	}
}

function NewText(newT : String)
{
	guiTexter.text = newT;
	guiTexter.color.a = 255;
}

function HideText()
{

	guiTexter.color.a = 0;
	guiTexter.text = "";
}

function ShowGUI(state : boolean)
{
	for (var child : Transform in guiLayout.transform)
		child.gameObject.SetActive(state);

	guiLayout.gameObject.SetActive(state);
}

function CreateHealth()
{
	if(maxHealth ==0)
		Debug.Log("Falha HEALTH");

	healthBars = new GameObject[maxHealth];
	
	healthCount = maxHealth;

	for (var i: int = 0; i<maxHealth; i++)
	{
		var newBar : GameObject = Instantiate(guiHealth, guiHealth.transform.position, Quaternion.identity);
		newBar.transform.position.x += i *0.15;
		newBar.transform.parent = guiLayout;
		healthBars[i] = newBar;
		yield;
	}

	Destroy(guiHealth.gameObject);
}

function ShowCredits(state : boolean)
{
	for(var i : int = 0; i < credits.length; i++)
	{
		var cre : TextMesh = credits[i];
		cre.renderer.enabled = state;
	}
}

function FadeIn(fade : float)
{
	//blackScreen.color.a = 1;
	while (blackScreen.color.a > fade)
	{
		blackScreen.color.a -= 0.005;
		yield;
	}
	blackScreen.color.a = fade;

}

function FadeOut(fade : float)
{
	//blackScreen.color.a = 1;
	while (blackScreen.color.a < fade)
	{
		blackScreen.color.a += 0.005;
		yield;
	}
	blackScreen.color.a = fade;

}

//-------------------------------//
//-----------LOAD / SAVE
//-------------------------------//

function SaveGame()
{
	PlayerPrefsX.SetBool("saved", true);
	PlayerPrefs.SetInt("clones", mainCTRL.livesCount);
	PlayerPrefs.SetInt("crystals", mainCTRL.crystalCount);
	PlayerPrefs.SetInt("health", healthCount);
	PlayerPrefs.SetFloat("timer", theTime);
	PlayerPrefs.SetFloat("fuel", fuelMeter);
	PlayerPrefsX.SetBool("reactorCol", mainCTRL.reactorCollected);
	
	if(!charCTRL.charDead)
		PlayerPrefsX.SetVector3("playerPos", charCTRL.gameObject.transform.position);
	else
		PlayerPrefsX.SetVector3("playerPos", charCTRL.spawner.transform.position);
	
	NotificationCenter.DefaultCenter().PostNotification(this, "SaveGame");
	
	PlayerPrefs.Save();
	
	Debug.Log("Game Saved");
}

function LoadGame()
{
	mainCTRL.livesCount = PlayerPrefs.GetInt("clones");
	mainCTRL.crystalCount = PlayerPrefs.GetInt("crystals");
	//fuel
	fuelMeter = PlayerPrefs.GetFloat("fuel");
	savedTime = PlayerPrefs.GetFloat("timer");

	Debug.Log("GUI loaded");
}