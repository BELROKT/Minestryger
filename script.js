"use strict"

var canvas = document.getElementById("kanvas")
var context = canvas.getContext("2d")
var xtal = 0
var ytal = 0
var width = 36
var height = 4
var size = 20

width = window.innerWidth/(size+1)
height = window.innerHeight/(size+1)

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function randomInteger(number) {
    return Math.floor(Math.random() * number)
}

function randomColor() {
    return "rgb(" + randomInteger(255) + "," + randomInteger(255) + "," + randomInteger(255) + ")"
}

function drawBox(x, y) {
    context.fillStyle = randomColor()
    context.fillRect((size+1)*x, (size+1)*y, size, size)
}

function updateBox() {
    drawBox(randomInteger(width), randomInteger(height))
}

while (ytal < height) {
    while (xtal < width) {
        drawBox(xtal, ytal)
        xtal = xtal + 1
    }
    ytal = ytal + 1
    xtal = 0
}

setInterval(updateBox,10)