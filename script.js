"use strict"

class Game {
    constructor() {
        this.canvas = document.getElementById("kanvas")
        this.context = this.canvas.getContext("2d")
        this.width = 30
        this.height = 16
        this.size = 20
        this.seconds = 0
        this.bombCount = 99
        this.bombsMarked = 0
        this.timerId
        this.fields = []
        this.highscoresNewbie = this.loadHighscore("highscoresNewbie")
        this.highscoresTrained = this.loadHighscore("highscoresTrained")
        this.highscoresExpert = this.loadHighscore("highscoresExpert")
        this.highscoresNewbieNoFlags = this.loadHighscore("highscoresNewbieNoFlags")
        this.highscoresTrainedNoFlags = this.loadHighscore("highscoresTrainedNoFlags")
        this.highscoresExpertNoFlags = this.loadHighscore("highscoresExpertNoFlags")
        this.rightMouseDown = false
        this.middleMouseDown = false
        this.leftMouseDown = false
        this.allowFlags = true
        this.lastScore = {}

        this.setTempWidth()

        this.canvas.width = this.width * (this.size)
        this.canvas.height = this.height * (this.size)
        this.context.font = this.size + "px serif"
        this.context.textAlign = "center"

        this.canvas.addEventListener("mouseup", (event) => { this.mouseUp(event) })
        this.canvas.addEventListener("mousedown", (event) => { this.mouseDown(event) })
        this.canvas.addEventListener("mousemove", (event) => { this.mouseMove(event) })
        this.canvas.addEventListener("mouseleave", (event) => { this.mouseLeave(event) })
        this.canvas.addEventListener("contextmenu", (event) => { event.preventDefault() })
    }

    clearMap() {
        this.stopTimer()
        this.seconds = 0
        document.getElementById("timer").innerHTML = this.seconds
        this.bombsMarked = 0
        this.bombsLeft = this.bombCount
        this.updateBombsLeft()

        this.setTempWidth()
        document.getElementById("bedsteTidNavn").style.display = "none"

        this.canvas.width = this.width * (this.size)
        this.canvas.height = this.height * (this.size)
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

            document.body.style.backgroundColor = "lightblue"
            var elements = document.getElementsByClassName('gruppeTitler');
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.backgroundColor = "cadetblue";
            }
        }
    }

    drawBox(x, y, text, color, textcolor = "black", textfont = "bold " + (this.size - 4) + "px arial") {
        this.context.fillStyle = color
        this.context.fillRect(this.size * x + 1, this.size * y + 1, this.size - 2, this.size - 2)
        this.context.fillStyle = textcolor
        this.context.font = textfont
        this.context.textAlign = "center"
        this.context.fillText(text, (this.size) * x + 0.5 * this.size, (this.size) * y + 0.80 * this.size)
    }

    drawField(x, y, hover) {
        var field = this.fields[y][x]
        var color = "grey"
        var text = ""
        var textfont = "bold " + (this.size - 4) + "px arial"
        var textcolor = "black"
        if (field.revealed) {
            if (field.bomb) {
                color = "red"
                text = "💣"
                textfont = this.context.font = (this.size - 8) + "px serif"
            }
            else {
                color = "white"
                if (field.surroundingBombs == 0) {
                    text = ""
                }
                else {
                    text = field.surroundingBombs
                    switch (field.surroundingBombs) {
                        case 1: textcolor = "#0100fe"; break
                        case 2: textcolor = "#017f01"; break
                        case 3: textcolor = "#fe0000"; break
                        case 4: textcolor = "#010080"; break
                        case 5: textcolor = "#810102"; break
                        case 6: textcolor = "#008081"; break
                        case 7: textcolor = "#000"; break
                        case 8: textcolor = "#808080"; break
                    }
                }
            }
        }
        else {
            if (field.locked) {
                text = "⚑"
                textfont = (this.size - 4) + "px serif"
                textcolor = "red"
            }
            else if (hover) {
                color = "lightgrey"
            }
        }
        this.drawBox(x, y, text, color, textcolor, textfont)
    }

    updateAll() {
        this.updateWidth()
        this.updateHeight()
        this.updateBombCount()
        this.updateAllowFlags()
        this.clearMap()
    }

    updateWidth() {
        var count = document.getElementById("vidde").value
        if (count < 1) {
            count = 1
        }
        this.width = count
    }

    updateHeight() {
        var count = document.getElementById("højde").value
        if (count < 1) {
            count = 1
        }
        this.height = count
    }

    updateBombCount() {
        var count = document.getElementById("bombeTal").value
        if (count >= this.width * this.height) {
            count = this.width * this.height - 1
        }
        this.bombCount = count
    }

    updateAllowFlags() {
        this.allowFlags = document.getElementById("mineFlag").checked
    }

    updateSettings(width, height, bombCount) {
        document.getElementById("vidde").value = width
        document.getElementById("højde").value = height
        document.getElementById("bombeTal").value = bombCount
    }

    gridPositionFromMousePosition(event) {
        var rect = this.canvas.getBoundingClientRect()
        var mx = event.clientX - rect.left
        var my = event.clientY - rect.top
        var x = Math.floor(mx / this.size)
        var y = Math.floor(my / this.size)
        return { x: x, y: y }
    }

    mouseUp(event) {
        var pos = this.gridPositionFromMousePosition(event)
        if (this.hasFinished()) {
            return
        }
        if (event.button == 0) {
            this.leftMouseDown = false

            this.leftClick(pos.x, pos.y)

            if (this.rightMouseDown) {
                this.middleClick(pos.x, pos.y)
            }
        }
        if (event.button == 1) {
            this.middleClick(pos.x, pos.y)
            this.middleMouseDown = false
        }
        if (event.button == 2) {
            this.rightMouseDown = false

            if (this.leftMouseDown) {
                this.middleClick(pos.x, pos.y)
            }
        }
        this.resetLastHoverPosition()
    }

    mouseDown(event) {
        var pos = this.gridPositionFromMousePosition(event)
        if (this.hasFinished()) {
            return
        }
        if (event.button == 0) {
            this.leftMouseDown = true
        }
        if (event.button == 1) {
            this.middleMouseDown = true
        }
        if (event.button == 2) {
            this.rightMouseDown = true

            this.rightClick(pos.x, pos.y)
        }
        this.showMiddleClickHover(pos)
    }

    leftClick(x, y) {
        if (this.timerId == undefined) {
            this.firstClick(x, y)
            this.updateCounts()
        }
        this.revealField(x, y)
    }

    middleClick(x, y) {
        var lockedFields = 0
        var field = this.fields[y][x]

        if (!field.revealed) {
            return
        }
        this.forSurroundingFields(x, y, (i, j, otherField) => {
            if (otherField.locked) {
                lockedFields += 1
            }
        })
        if (lockedFields == field.surroundingBombs) {
            this.forSurroundingFields(x, y, (i, j, otherField) => {
                this.revealField(i, j)
            })
        }
    }

    rightClick(x, y) {
        this.rightMouseDown = true

        if (this.timerId == undefined) {
            return
        }
        if (this.fields[y][x].revealed) {
            return
        }
        if (this.allowFlags == false) {
            return
        }
        this.fields[y][x].locked = !this.fields[y][x].locked
        this.drawField(x, y)
        if (this.fields[y][x].locked) {
            this.bombsMarked += 1
            this.updateBombsLeft()
        }
        else {
            this.bombsMarked -= 1
            this.updateBombsLeft()
        }
    }

    mouseMove(event) {
        var pos = this.gridPositionFromMousePosition(event)
        if (this.lastPos !== undefined && pos.x == this.lastPos.x && pos.y == this.lastPos.y) {
            return
        }
        this.resetLastHoverPosition()
        if (!this.fields[pos.y][pos.x].revealed) {
            this.drawField(pos.x, pos.y, true)
        }
        this.showMiddleClickHover(pos)
        this.lastPos = pos
    }

    showMiddleClickHover(pos) {
        if ((this.leftMouseDown && this.rightMouseDown) || (this.middleMouseDown)) {
            this.forSurroundingFields(pos.x, pos.y, (i, j, otherField) => {
                if (!otherField.locked && !otherField.revealed) {
                    this.drawField(i, j, true)
                }
            })
        }
    }

    resetLastHoverPosition() {
        if (this.lastPos != undefined) {
            if (this.isWithinGrid(this.lastPos.x, this.lastPos.y)) {
                this.forSurroundingFields(this.lastPos.x, this.lastPos.y, (i, j, otherField) => {
                    //if (!otherField.locked&&!otherField.revealed) {
                    this.drawField(i, j)
                    //}
                })
                if (!this.fields[this.lastPos.y][this.lastPos.x].revealed) {
                    this.drawField(this.lastPos.x, this.lastPos.y)
                }
            }
        }
    }

    mouseLeave(event) {
        if (this.lastPos != undefined) {
            if (!this.fields[this.lastPos.y][this.lastPos.x].revealed) {
                this.drawField(this.lastPos.x, this.lastPos.y)
            }
        }
    }

    isWithinGrid(x, y) {
        if ((x < 0) || (x > this.width)) {
            return false
        }
        if ((y < 0) || (y > this.height)) {
            return false
        }
        return true
    }

    firstClick(mx, my) {
        var field = this.fields[my][mx]
        field.bomb = true
        var b = 0
        while (b < this.bombCount) {
            var x = randomInteger(this.width)
            var y = randomInteger(this.height)
            if (this.fields[y][x].bomb == true) {
                continue
            }
            this.fields[y][x].bomb = true
            b += 1
        }
        field.bomb = false
        var emptyFields = false
        this.forFieldInMap((i, j, otherField) => {
            this.countBombs(i, j)
            if (otherField.surroundingBombs == 0) {
                emptyFields = true
            }
        })
        if ((field.surroundingBombs > 0) && (emptyFields)) {
            this.forFieldInMap((i, j, otherField) => {
                otherField.surroundingBombs = 0
                otherField.bomb = false
            })
            this.firstClick(mx, my)
        }
        else {
            this.timer()
            this.timerId = setInterval(() => { this.timer() }, 1000)
            this.forFieldInMap((i, j, otherField) => {
                otherField.surroundingBombs = 0
            })
        }
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
        if (this.hasWon()) {
            if (!this.hasFinished()) {
                if (this.isNewScoreHighscore()) {
                    document.getElementById("bedsteTidNavn").style.display = ""
                    viewStats()
                    this.updateHighscore()
                    this.showHighscore()
                }
                document.body.style.backgroundColor = "darkseagreen"
                var elements = document.getElementsByClassName('gruppeTitler');
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.backgroundColor = "olivedrab";
                }
            }
            this.stopTimer()
        }
    }

    updateHighscore() {
        if (this.width == 9 && this.height == 9 && this.bombCount == 10) {
            if (this.allowFlags) {
                this.saveHighscore("highscoresNewbie")
            }
            else {
                this.saveHighscore("highscoresNewbieNoFlags")
            }
        }
        if (this.width == 16 && this.height == 16 && this.bombCount == 40) {
            if (this.allowFlags) {
                this.saveHighscore("highscoresTrained")
            }
            else {
                this.saveHighscore("highscoresTrainedNoFlags")
            }
        }
        if (this.width == 30 && this.height == 16 && this.bombCount == 99) {
            if (this.allowFlags) {
                this.saveHighscore("highscoresExpert")
            }
            else {
                this.saveHighscore("highscoresExpertNoFlags")
            }
        }
        viewStats()
        this.showHighscore()
    }

    updateName() {
        this.lastScore.name = this.getName()
        viewStats()
        this.showHighscore()
        document.getElementById("bedsteTidNavn").style.display = "none"
        this.storeHighscores()
    }

    showHighscoreFor(group, highscoreKey, id) {
        var text = group + "\n"
        for (var i = 0; i < this[highscoreKey].length; i += 1) {
            var date = this.formatDate(this[highscoreKey][i].date)
            text += "<span title=\"" + date + "\">" + this[highscoreKey][i].name + ": " + this[highscoreKey][i].score + "</span>\n"
        }
        document.getElementById(id).innerHTML = text
    }

    formatDate(date) {
        if (!date) {
            return ""
        }
        date = new Date(date)
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    }

    showHighscore() {
        this.showHighscoreFor("Begynder", "highscoresNewbie", "bestTimeNewbie")
        this.showHighscoreFor("Øvet", "highscoresTrained", "bestTimeTrained")
        this.showHighscoreFor("Ekspert", "highscoresExpert", "bestTimeExpert")
        this.showHighscoreFor("Begynder", "highscoresNewbieNoFlags", "bestTimeNewbieNoFlags")
        this.showHighscoreFor("Øvet", "highscoresTrainedNoFlags", "bestTimeTrainedNoFlags")
        this.showHighscoreFor("Ekspert", "highscoresExpertNoFlags", "bestTimeExpertNoFlags")
    }

    isNewScoreHighscoreFor(width, height, bombCount, allowFlags, highscoreKey) {
        if (this.width == width && this.height == height && this.bombCount == bombCount && this.allowFlags == allowFlags) {
            if (this[highscoreKey].length < 10) {
                return true
            }
            return (this.seconds - 1) < this[highscoreKey][this[highscoreKey].length - 1].score
        }
        return false
    }

    isNewScoreHighscore() {
        if (this.isNewScoreHighscoreFor(9, 9, 10, true, "highscoresNewbie")) {
            return true
        }
        if (this.isNewScoreHighscoreFor(16, 16, 40, true, "highscoresTrained")) {
            return true
        }
        if (this.isNewScoreHighscoreFor(30, 16, 99, true, "highscoresExpert")) {
            return true
        }
        if (this.isNewScoreHighscoreFor(9, 9, 10, false, "highscoresNewbieNoFlags")) {
            return true
        }
        if (this.isNewScoreHighscoreFor(16, 16, 40, false, "highscoresTrainedNoFlags")) {
            return true
        }
        if (this.isNewScoreHighscoreFor(30, 16, 99, false, "highscoresExpertNoFlags")) {
            return true
        }
        return false
    }

    getName() {
        if (document.getElementById("skrivNavn").value == "") {
            return "Ukendt"
        }
        return document.getElementById("skrivNavn").value
    }

    saveHighscore(highscoreKey) {
        this.lastScore = { name: this.getName(), score: this.seconds - 1, date: new Date() }
        this[highscoreKey].push(this.lastScore)
        this[highscoreKey].sort((a, b) => { return a.score - b.score })
        if (this[highscoreKey].length > 10) {
            this[highscoreKey].pop()
        }
        localStorage[highscoreKey] = JSON.stringify(this[highscoreKey])
    }

    storeHighscores() {
        localStorage.highscoresNewbie = JSON.stringify(this.highscoresNewbie)
        localStorage.highscoresTrained = JSON.stringify(this.highscoresTrained)
        localStorage.highscoresExpert = JSON.stringify(this.highscoresExpert)
        localStorage.highscoresNewbieNoFlags = JSON.stringify(this.highscoresNewbieNoFlags)
        localStorage.highscoresTrainedNoFlags = JSON.stringify(this.highscoresTrainedNoFlags)
        localStorage.highscoresExpertNoFlags = JSON.stringify(this.highscoresExpertNoFlags)
    }

    loadHighscore(highscoreKey) {
        if (localStorage[highscoreKey]) {
            return JSON.parse(localStorage[highscoreKey])
        }
        return []
    }

    resetHighscores(keyword) {
        if (keyword == "Newbie") {
            this.highscoresNewbie = []
        }
        if (keyword == "Trained") {
            this.highscoresTrained = []
        }
        if (keyword == "Expert") {
            this.highscoresExpert = []
        }
        if (keyword == "NewbieNoFlags") {
            this.highscoresNewbieNoFlags = []
        }
        if (keyword == "TrainedNoFlags") {
            this.highscoresTrainedNoFlags = []
        }
        if (keyword == "ExpertNoFlags") {
            this.highscoresExpertNoFlags = []
        }
        if (keyword == "All") {
            this.highscoresNewbie = []
            this.highscoresTrained = []
            this.highscoresExpert = []
            this.highscoresNewbieNoFlags = []
            this.highscoresTrainedNoFlags = []
            this.highscoresExpertNoFlags = []
        }
    }

    hasWon() {
        var everythingRevealed = true
        this.forFieldInMap((i, j, otherField) => {
            if ((!otherField.revealed) && (!otherField.bomb)) {
                everythingRevealed = false
            }
        })
        return everythingRevealed
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
                x += 1
            }
            y += 1
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

    updateBombsLeft() {
        this.bombsLeft = this.bombCount - this.bombsMarked

        document.getElementById("mineTæller").innerHTML = this.bombsLeft
    }

    setTempWidth() {
        var elements = document.getElementsByClassName("fyld")
        var tempWidth = (this.width * (this.size) - 38) / 2
        if (tempWidth < 143) {
            tempWidth = 143
        }
        elements[0].style.width = tempWidth + "px"
        elements[1].style.width = tempWidth + "px"
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

function viewSettings() {
    document.getElementById("værdier").style.display = ""
    document.getElementById("statistik").style.display = "none"
}

function viewStats() {
    document.getElementById("statistik").style.display = ""
    document.getElementById("værdier").style.display = "none"
}

var game = new Game()
game.clearMap()
