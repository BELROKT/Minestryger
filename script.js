"use strict"

var canvas = document.getElementById("kanvas")
var context = canvas.getContext("2d")
var red = Math.floor(Math.random() * 255)
var green = Math.floor(Math.random() * 255)
var blue = Math.floor(Math.random() * 255)


context.fillStyle = "rgb(" + red.toString() + "," + green.toString() + "," + blue.toString() + ")"
context.fillRect(Math.random() * 290, Math.random() * 140, 10, 10)