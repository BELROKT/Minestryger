"use strict"

var canvas = document.getElementById("kanvas")
var context = canvas.getContext("2d")
var xtal = 0
var ytal = 0
var width = 36
var height = 4
var size = 20

width = window.innerWidth / (size + 1)
height = window.innerHeight / (size + 1)

canvas.width = window.innerWidth
canvas.height = window.innerHeight
context.fillStyle = "black"
context.fillRect(0, 0, window.innerWidth, window.innerHeight)
context.font = size + "px serif"
context.textAlign = "center"

function randomInteger(number) {
    return Math.floor(Math.random() * number)
}

function randomColor() {
    return "rgb(" + randomInteger(255) + "," + randomInteger(255) + "," + randomInteger(255) + ")"
}

function drawBox(x, y, text, color) {
    context.fillStyle = color
    context.fillRect((size + 1) * x, (size + 1) * y, size, size)
    context.fillStyle = "black"
    context.fillText(text, (size + 1) * x + 0.5 * size, (size + 1) * y + 0.8 * size)
}

function updateBox(event) {
    if (((event.clientX + 1) % (size + 1) == 0) || ((event.clientY + 1) % (size + 1) == 0)) {
        return
    }
    var x = Math.floor(event.clientX / (size + 1))
    var y = Math.floor(event.clientY / (size + 1))

    drawBox(x, y, fields[y][x], "white")
    fields[y][x] = fields[y][x] + 1
}

var fields = []

while (ytal < height) {
    var subList = []
    fields.push(subList)
    while (xtal < width) {
        drawBox(xtal, ytal, "", "grey")
        fields[ytal].push(0)
        xtal = xtal + 1
    }
    ytal = ytal + 1
    xtal = 0
}

//setInterval(updateBox,10)

canvas.addEventListener("click", updateBox)