"use strict"

var canvas = document.getElementById("kanvas")
var context = canvas.getContext("2d")
var xtal = 0
var ytal = 0
var width = 30
var height = 16
var size = 20

canvas.width = width * (size + 1)
canvas.height = height * (size + 1)
context.fillStyle = "black"
context.fillRect(0, 0, canvas.width, canvas.height)
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

function clickBox(event) {
    var rect = canvas.getBoundingClientRect()
    var mx = event.clientX - rect.left
    var my = event.clientY - rect.top
    if (((mx + 1) % (size + 1) == 0) || ((my + 1) % (size + 1) == 0)) {
        return
    }
    var x = Math.floor(mx / (size + 1))
    var y = Math.floor(my / (size + 1))
    if (bombetal == 0) {
        firstClick(x, y)
        updateCounts()
    }
    revealField(x, y)
}

function revealField(x, y) {
    if ((x >= width) || (y >= height)) {
        return
    }
    var field = fields[y][x]
    if (field.revealed) {
        return
    }
    if (field.bomb) {
        drawBox(x, y, "B", "red")
    }
    else {
        drawBox(x, y, field.surroundingBombs, "white")
    }
    field.revealed = true
    if (field.bomb) {
        clearInterval(timerId)
        forFieldInMap(function (i, j, otherField) {
            if (otherField.bomb) {
                revealField(i, j)
            }
        })
    }
    else if (field.surroundingBombs == 0) {
        forSurroundingFields(x, y, function (xm, yn, otherField) {
            revealField(xm, yn)
        })
    }
    var everythingRevealed = true
    forFieldInMap(function (i, j, otherField) {
        if ((!otherField.revealed) && (!otherField.bomb)) {
            everythingRevealed = false
        }

    })
    if (everythingRevealed) {
        clearInterval(timerId)
    }
}

function randomBomb() {
    if (Math.random() < (99 / 480)) {
        return "B"
    }
    else {
        return 0
    }
}

function revealMap() {
    forFieldInMap(revealField)
}

function updateCounts() {
    forFieldInMap(countBombs)
}

function forFieldInMap(callback) {
    var x = 0
    var y = 0
    while (y < height) {
        while (x < width) {
            callback(x, y, fields[y][x])
            x = x + 1
        }
        y = y + 1
        x = 0
    }
}

function forSurroundingFields(x, y, callback) {
    var m = -1
    var n = -1
    while (n < 2) {
        if ((y + n < 0) || (y + n >= height)) {
            n += 1
            continue
        }
        while (m < 2) {
            if ((m == 0) && (n == 0)) {
                m += 1
                continue
            }
            if ((x + m < 0) || (x + m >= width)) {
                m += 1
                continue
            }
            callback(x + m, y + n, fields[y + n][x + m])
            m += 1
        }
        n += 1
        m = -1
    }
}

function countBombs(x, y) {
    if (fields[y][x].bomb) {
        return
    }
    forSurroundingFields(x, y, function (xm, yn, field) {
        if (field.bomb) {
            fields[y][x].surroundingBombs += 1
        }
    })
}

function newField() {
    return {
        bomb: false,
        revealed: false,
        surroundingBombs: 0,
        locked: false
    }
}

var fields = []

while (ytal < height) {
    var subList = []
    fields.push(subList)
    while (xtal < width) {
        drawBox(xtal, ytal, "", "grey")
        fields[ytal].push(newField())
        xtal += 1
    }
    ytal += 1
    xtal = 0
}

var bombetal = 0
var timerId

function firstClick(mx, my) {
    fields[my][mx].bomb = true
    while (bombetal < 99) {
        var x = randomInteger(width)
        var y = randomInteger(height)
        if (fields[y][x].bomb == true) {
            continue
        }
        fields[y][x].bomb = true
        bombetal += 1
    }
    fields[my][mx].bomb = false
    timer()
    timerId = setInterval(timer, 1000)
}

var seconds = 0

function timer() {
    document.getElementById("timer").innerHTML = seconds
    seconds += 1
}

canvas.addEventListener("click", clickBox)