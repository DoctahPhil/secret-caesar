'use strict';

/*
* Decks have 17 cards: 6 liberal, 11 fascist.
* In bit-packed boolean arrays, 1 is liberal, 0 is fascist.
* The most significant bit is always 1.
* E.g. 0b101001 represents a deck with 2 liberal and 3 fascist cards
*/

function length(deck)
{
	return Math.floor(Math.log2(deck));
}

function shuffle(deck)
{
	let l = length(deck);
	for(let i=l-1; i>0; i--)
	{
		let o = Math.floor(Math.random() * i);
		let iVal = deck & 1 << i, oVal = deck & 1 << o;
		let swapped = iVal >>> i-o | oVal << i-o;
		deck = deck - iVal - oVal + swapped;
	}

	return deck;
}

/**
 * Draw the top three cards from the given deck as another BPBA
 * @param {BPBA} d 
 * @returns [BPBA, BPBA] updated deck, hand
 */
function drawThree(d)
{
	return d < 8 ? [1, d] : [d >>> 3, 8 | d & 7];
}

/**
 * Remove the card at the given position from the given deck
 * @param {BPBA} deck 
 * @param {int} pos 
 * @returns {BPBA, int} updated deck, discarded card
 */
function discardOne(deck, pos)
{
	let bottomHalf = deck & (1 << pos)-1;
	let topHalf = deck & ~((1 << pos+1)-1);
	topHalf >>>= 1;
	let newDeck = topHalf | bottomHalf;
	
	let val = (deck & 1<<pos) >>> pos;

	return [newDeck, val];
}

/**
 * Add the given card to the top of the deck
 * @param {BPBA} deck 
 * @param {int} val 
 * @returns {BPBA} updated deck
 */
function appendCard(deck, val)
{
	return deck << 1 | val;
}

/**
 * Combine two decks into one
 * @param {BPBA} deck1
 * @param {BPBA} deck2
 * @returns {BPBA}
 */
function concat(deck1, deck2)
{
	let d2len = length(deck2);
	let d2cards = deck2 & ((1<<d2len) - 1);
	return (deck1 << d2len) | d2cards;
}

module.exports = {length, shuffle, drawThree, discardOne, appendCard, concat, FULL_DECK: 0x2003f, LIBERAL: 1, FASCIST: 0};