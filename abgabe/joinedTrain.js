

class JoinedTrain extends Train {
    sign; subTrains;
    constructor(id, position, level) {
        super(id, undefined, position, level);
        this.visible = false;
        this.sign = "";
        this.subTrains = [];
    }

    updateSign(sign) {
        this.sign = sign;
        this.#calculate();
    }

    connectWith(train1, train2) {
        this.subTrains = [];
        this.subTrains.push(train1);
        this.subTrains.push(train2);
        this.visible = true;
        this.#calculate();
    }

    disconnectFrom(trainId) {
        let subtrainsIds = this.subTrains.map(x => x.id);
        if (subtrainsIds.includes(trainId)) {
            this.subTrains = this.subTrains.filter(x => x.id != trainId);
            this.sign = "";
            this.#calculate();
        }
    }

    // after station added or connecting
    #calculate() {
        if (this.sign.match(/^[*/+-]+$/) && this.subTrains.length == 2) {
            // right appearance in the equation
            this.subTrains.sort((x, y) => x.id - y.id);

            // not necessary brackets removed
            let train1 = this.subTrains[0];
            let train2 = this.subTrains[1];
            let ex1 = "(" + String(train1.eqString) + ")" + this.sign + "(" + String(train2.eqString) + ")";
            let ex2 = "(" + String(train1.eqString) + ")" + this.sign + String(train2.eqString);
            let ex3 = String(train1.eqString) + this.sign + "(" + String(train2.eqString) + ")";
            let ex4 = String(train1.eqString) + this.sign + String(train2.eqString);
            switch (eval(ex1)) {
                case eval(ex4): this.eqString = ex4; break;
                case eval(ex2): this.eqString = ex2; break;
                case eval(ex3): this.eqString = ex3; break;
                default: this.eqString = ex1;
            }
        } else if (this.subTrains.length == 1) {
            let train1 = this.subTrains[0];
            this.eqString = train1.eqString;
        }
        this.value = eval(this.eqString);
    }
}