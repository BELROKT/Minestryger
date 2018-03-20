"use strict"

class Game {
    constructor() {
        this.canvas = document.getElementById("kanvas")
        this.context = this.canvas.getContext("2d")
        this.width = 30
        this.height = 16
        this.size = 20
        this.seconds = 0
        this.bombetal = 99
        this.timerId
        this.fields = []

        var elements = document.getElementsByClassName("fyld")
        elements[0].style.width = (this.width * (this.size + 1) - 43) / 2 + "px"
        elements[1].style.width = (this.width * (this.size + 1) - 43) / 2 + "px"

        this.canvas.width = this.width * (this.size + 1)
        this.canvas.height = this.height * (this.size + 1)
        this.context.font = this.size + "px serif"
        this.context.textAlign = "center"

        this.canvas.addEventListener("mouseup", (event) => { this.clickBox(event) })
        this.canvas.addEventListener("mousemove", (event) => { this.mouseMove(event) })
        this.canvas.addEventListener("mouseleave", (event) => { this.mouseLeave(event) })
        this.canvas.addEventListener("contextmenu", (event) => { event.preventDefault() })
    }

    clearMap() {
        this.stopTimer()
        this.seconds = 0
        document.getElementById("timer").innerHTML = this.seconds
        this.canvas.width = this.width * (this.size + 1)
        this.canvas.height = this.height * (this.size + 1)
        this.context.fillStyle = "black"
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.fields = []
        var xtal = 0
        var ytal = 0
        while (ytal < this.height) {
            var subList = []
            this.fields.push(subList)
            while (xtal < this.width) {
                this.fields[ytal].push(new Field())
                this.drawField(xtal, ytal)
                xtal += 1
            }
            ytal += 1
            xtal = 0
        }
    }

    drawBox(x, y, text, color) {
        this.context.fillStyle = color
        this.context.fillRect((this.size + 1) * x, (this.size + 1) * y, this.size, this.size)
        this.context.fillStyle = "black"
        if (text == "💣") {
            this.context.font = (this.size - 8) + "px georgia"
        }
        else {
            this.context.font = "bold " + (this.size - 4) + "px arial"
        }
        this.context.textAlign = "center"
        this.context.fillText(text, (this.size + 1) * x + 0.5 * this.size, (this.size + 1) * y + 0.80 * this.size)
    }

    drawField(x, y, hover) {
        var field = this.fields[y][x]
        var color = "grey"
        var text = ""
        if (field.revealed) {
            if (field.bomb) {
                color = "red"
                text = "💣"
            }
            else {
                color = "white"
                text = field.surroundingBombs
            }
        }
        else {
            if (field.locked) {
                text = "F"
            }
            if (hover) {
                color = "lightgrey"
            }
        }
        this.drawBox(x, y, text, color)
    }

    gridPositionFromMousePosition(event) {
        var rect = this.canvas.getBoundingClientRect()
        var mx = event.clientX - rect.left
        var my = event.clientY - rect.top
        if (((mx + 1) % (this.size + 1) == 0) || ((my + 1) % (this.size + 1) == 0)) {
            return
        }
        var x = Math.floor(mx / (this.size + 1))
        var y = Math.floor(my / (this.size + 1))
        return { x: x, y: y }
    }

    clickBox(event) {
        var pos = this.gridPositionFromMousePosition(event)
        if (this.hasFinished()) {
            return
        }
        if (event.button == 0) {
            this.leftClick(pos.x, pos.y)
        }
        if (event.button == 2) {
            this.rightClick(pos.x, pos.y)
        }
    }

    leftClick(x, y) {
        if (this.timerId == undefined) {
            this.firstClick(x, y)
            this.updateCounts()
        }
        this.revealField(x, y)
    }

    rightClick(x, y) {
        if (this.timerId == undefined) {
            return
        }
        if (this.fields[y][x].revealed) {
            return
        }
        this.fields[y][x].locked = !this.fields[y][x].locked
        this.drawField(x, y)
    }
    
    mouseMove(event) {
        var pos = this.gridPositionFromMousePosition(event)
        if (this.lastPos != undefined) {
            if (!this.fields[this.lastPos.y][this.lastPos.x].revealed) {
                this.drawField(this.lastPos.x, this.lastPos.y)
            }
        }
        if (!this.fields[pos.y][pos.x].revealed) {
            this.drawField(pos.x, pos.y, true)
            this.lastPos = pos
        }
    }

    mouseLeave(event) {
        if (this.lastPos != undefined) {
            if (!this.fields[this.lastPos.y][this.lastPos.x].revealed) {
                this.drawField(this.lastPos.x, this.lastPos.y)
            }
        }
    }

    firstClick(mx, my) {
        this.fields[my][mx].bomb = true
        var b = 0
        while (b < this.bombetal) {
            var x = randomInteger(this.width)
            var y = randomInteger(this.height)
            if (this.fields[y][x].bomb == true) {
                continue
            }
            this.fields[y][x].bomb = true
            b += 1
        }
        this.fields[my][mx].bomb = false
        this.timer()
        this.timerId = setInterval(() => { this.timer() }, 1000)
    }

    hasFinished() {
        if (this.timerId != undefined) {
            return false
        }
        if (this.seconds > 0) {
            return true
        }
        return false
    }

    stopTimer() {
        clearInterval(this.timerId)
        this.timerId = undefined
    }

    revealField(x, y) {
        if ((x >= this.width) || (y >= this.height)) {
            return
        }
        var field = this.fields[y][x]
        if (field.revealed) {
            return
        }
        if (field.locked) {
            return
        }
        field.revealed = true
        this.drawField(x, y)
        if (field.bomb) {
            this.stopTimer()
            this.forFieldInMap((i, j, otherField) => {
                if (otherField.bomb) {
                    this.revealField(i, j)
                }
            })
        }
        else if (field.surroundingBombs == 0) {
            this.forSurroundingFields(x, y, (xm, yn, otherField) => {
                this.revealField(xm, yn)
            })
        }
        var everythingRevealed = true
        this.forFieldInMap((i, j, otherField) => {
            if ((!otherField.revealed) && (!otherField.bomb)) {
                everythingRevealed = false
            }
        })
        if (everythingRevealed) {
            this.stopTimer()
        }
    }

    revealMap() {
        this.forFieldInMap((x, y, field) => { this.revealField(x, y, field) })
    }

    updateCounts() {
        this.forFieldInMap((x, y, field) => { this.countBombs(x, y, field) })
    }

    forFieldInMap(callback) {
        var x = 0
        var y = 0
        while (y < this.height) {
            while (x < this.width) {
                callback(x, y, this.fields[y][x])
                x = x + 1
            }
            y = y + 1
            x = 0
        }
    }

    forSurroundingFields(x, y, callback) {
        var m = -1
        var n = -1
        while (n < 2) {
            if ((y + n < 0) || (y + n >= this.height)) {
                n += 1
                continue
            }
            while (m < 2) {
                if ((m == 0) && (n == 0)) {
                    m += 1
                    continue
                }
                if ((x + m < 0) || (x + m >= this.width)) {
                    m += 1
                    continue
                }
                callback(x + m, y + n, this.fields[y + n][x + m])
                m += 1
            }
            n += 1
            m = -1
        }
    }

    countBombs(x, y) {
        if (this.fields[y][x].bomb) {
            return
        }
        this.forSurroundingFields(x, y, (xm, yn, field) => {
            if (field.bomb) {
                this.fields[y][x].surroundingBombs += 1
            }
        })
    }

    timer() {
        document.getElementById("timer").innerHTML = this.seconds
        this.seconds += 1
    }
}

class Field {
    constructor() {
        this.bomb = false
        this.revealed = false
        this.surroundingBombs = 0
        this.locked = false
    }
}

function randomInteger(number) {
    return Math.floor(Math.random() * number)
}

function randomColor() {
    return "rgb(" + randomInteger(255) + "," + randomInteger(255) + "," + randomInteger(255) + ")"
}

var game = new Game()
game.clearMap()
