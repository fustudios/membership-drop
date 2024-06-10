"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D1 = exports.D0 = exports.Decimal = void 0;
function bigIntRound(x, decimals) {
    if (decimals <= 0n)
        return x;
    const y = 10n ** BigInt(decimals);
    return (x / y) * y + (x % y >= 5n * (y / 10n) ? y : 0n);
}
class Decimal {
    static maxDecimals = 256;
    static decimalSeparator = '.';
    _isDecimal = true;
    _val = 0n;
    _decimals = 18;
    constructor(val, decimals = 18) {
        Decimal.validateDecimals(decimals);
        this._val = val;
        this._decimals = decimals;
    }
    static from(val, decimals = 18) {
        if (val == null) {
            return new Decimal(0n, decimals);
        }
        else if (typeof val === 'string') {
            return Decimal.fromString(val, decimals);
        }
        else if (typeof val === 'number') {
            return Decimal.fromNumber(val, decimals);
        }
        else if (typeof val === 'bigint') {
            return new Decimal(BigInt(val), decimals);
        }
        else if (Decimal.isDecimal(val)) {
            return val.clone();
        }
        else {
            throw new Error(`Cound not create Decimal from ${val}`);
        }
    }
    static fromString(val, decimals = 18) {
        Decimal.validateDecimals(decimals);
        let [intPart, decPart] = (val.replace(/[^0-9.]/, '') + '.0').split(this.decimalSeparator);
        decPart = decPart.substring(0, decimals).padEnd(decimals, '0');
        return new Decimal(BigInt(`${intPart}${decPart}`), decimals);
    }
    static fromNumber(val, decimals = 18) {
        return Decimal.fromString(val.toString(), decimals);
    }
    static fromBnString(val, decimals = 18) {
        Decimal.validateDecimals(decimals);
        return new Decimal(BigInt(val), decimals);
    }
    toRawString() {
        const str = this._val.toString().padStart(this._decimals, '0');
        const separatorPos = str.length - this._decimals;
        const intPart = str.substring(0, separatorPos);
        const decPart = str.substring(separatorPos, str.length).replace(/0+$/, '');
        if (decPart === '') return intPart;
        return `${intPart}.${decPart}`;
    }
    toString(significantDigits, decimalDigits) {
        const valRounded = decimalDigits === undefined ? this._val : bigIntRound(this._val, this._decimals - decimalDigits);
        const str = valRounded.toString().padStart(this._decimals, '0');
        const separatorPos = str.length - this._decimals;
        const intPart = str.substring(0, separatorPos);
        const decPart = str.substring(separatorPos, str.length).replace(/0+$/, '');
        const intOut = new Intl.NumberFormat('en-US').format(BigInt(intPart));
        let decOut = decPart;
        if (significantDigits !== undefined) {
            decOut = decPart.substring(0, significantDigits - intPart.length);
        }
        else if (decimalDigits !== undefined) {
            decOut = decPart.toString().substring(0, decimalDigits);
            // decOut = bigIntRound(BigInt(decPart), BigInt(decimalDigits)).toString().substring(0, decimalDigits);
        }
        decOut = decOut.replace(/0+$/, '');
        return `${intPart ? intOut : '0'}${decOut === '' ? '' : Decimal.decimalSeparator}${decOut}`;
    }
    format(decimalDigits) {
        return this.toString(undefined, decimalDigits);
    }
    toNumber() {
        if (this._val === 0n)
            return 0;
        return parseFloat(this.toRawString());
    }
    toBigInt(decimals) {
        const tmp = decimals ? this.withDecimals(decimals) : this;
        return tmp._val;
    }
    unitFormat(maxDecimalDigits = 2) {
        const units = [
            { unit: 'T', value: 1e12 },
            { unit: 'G', value: 1e9 },
            { unit: 'M', value: 1e6 },
            { unit: 'K', value: 1e3 },
        ];
        for (const unit of units) {
            const unitDecimal = Decimal.from(unit.value);
            if (this.gte(unitDecimal)) {
                const decimalDigits = this.div(unitDecimal).gt(Decimal.from(100)) ? maxDecimalDigits - 1 : maxDecimalDigits;
                return this.div(unitDecimal).format(decimalDigits) + unit.unit;
            }
        }
        const decimalDigits = this.gt(Decimal.from(100))
            ? maxDecimalDigits - 1
            : Math.min(maxDecimalDigits + 2, Math.max(maxDecimalDigits, this.getFirstSignificantDecimalDigit() + maxDecimalDigits - 1));
        return this.format(decimalDigits);
    }
    valueOf() {
        return this.withDecimals(18).val;
    }
    setDecimals(newDecimals) {
        Decimal.validateDecimals(newDecimals);
        const diff = newDecimals - this._decimals;
        if (diff > 0) {
            this._val *= 10n ** BigInt(diff);
        }
        else {
            this._val /= 10n ** BigInt(-diff);
        }
        this._decimals = newDecimals;
        return this;
    }
    withDecimals(newDecimals) {
        return this.clone().setDecimals(newDecimals);
    }
    withDecimalsAs(b) {
        return this.clone().setDecimals(b._decimals);
    }
    withMoreDecimals(diff) {
        return this.withDecimals(this._decimals + diff);
    }
    withLessDecimals(diff) {
        if (diff > this._decimals)
            throw new Error('Cannot decrease decimals below 0');
        return this.withDecimals(this._decimals - diff);
    }
    plus(b) {
        b = Decimal.from(b);
        return new Decimal(this._val + b.withDecimalsAs(this).val, this._decimals);
    }
    minus(b) {
        b = Decimal.from(b);
        return new Decimal(this._val - b.withDecimalsAs(this).val, this._decimals);
    }
    times(b) {
        b = Decimal.from(b);
        const x = (this._val * b.val);
        const y = 10n ** BigInt(b.decimals);
        return new Decimal(
            (this._val * b.val) /
            10n ** BigInt(b.decimals),
            this._decimals);
    }
    div(b) {
        b = Decimal.from(b);
        return new Decimal(this.withMoreDecimals(b.decimals).val / b.val, this._decimals);
    }
    safeDiv(b) {
        b = Decimal.from(b);
        if (b.isZero())
            return exports.D0;
        return this.div(b);
    }
    intDiv(b) {
        return new Decimal(this._val / BigInt(b), this._decimals);
    }
    pow2(exp) {
        exp = BigInt(exp);
        const newVal = exp >= 0 ? this._val * 2n ** exp : this._val / 2n ** -exp;
        return new Decimal(newVal, this._decimals);
    }
    pow10(exp) {
        exp = BigInt(exp);
        const newVal = exp >= 0 ? this._val * 10n ** exp : this._val / 10n ** -exp;
        return new Decimal(newVal, this._decimals);
    }
    inverse() {
        return this.isZero() ? exports.D0 : Decimal.from(1).div(this);
    }
    upperCap(b) {
        if (typeof b === 'number') {
            b = Decimal.from(b);
        }
        else if (typeof b === 'bigint') {
            b = Decimal.from(b, 0);
        }
        return Decimal.min(this, b);
    }
    eq(b) {
        return this._val === b._val;
    }
    isZero() {
        return this._val === 0n;
    }
    lt(b) {
        return this < b.withDecimals(this._decimals);
    }
    lte(b) {
        return this <= b.withDecimals(this._decimals);
    }
    gt(b) {
        return this > b.withDecimals(this._decimals);
    }
    gtZero() {
        return this._val > 0n;
    }
    gte(b) {
        return this >= b.withDecimals(this._decimals);
    }
    static min(value, ...values) {
        for (const v of values)
            if (v < value)
                value = v;
        return value;
    }
    static max(value, ...values) {
        for (const v of values)
            if (v > value)
                value = v;
        return value;
    }
    abs() {
        return this.gt(exports.D0) ? this : exports.D0.clone().minus(this);
    }
    clone() {
        return new Decimal(this._val, this._decimals);
    }
    static validateDecimals(decimals) {
        if (!Number.isInteger(decimals))
            throw new Error(`Parameter 'decimals' has to be an integer, ${decimals} provided`);
        if (decimals > Decimal.maxDecimals)
            throw new Error(`Up to ${Decimal.maxDecimals} supported. You provided ${decimals}`);
    }
    get val() {
        return this._val;
    }
    get decimals() {
        return this._decimals;
    }
    getDecimals() {
        return this._decimals;
    }
    static isDecimal(value) {
        return !!(value && value._isDecimal);
    }
    getFirstSignificantDecimalDigit() {
        if (this.gte(exports.D1) || this.isZero())
            return 0;
        let tmp = this.clone();
        let digit = 0;
        while (tmp.lt(exports.D1)) {
            digit++;
            tmp = tmp.times(10);
        }
        return digit;
    }
}
exports.Decimal = Decimal;
exports.D0 = Decimal.from(0);
exports.D1 = Decimal.from(1);
