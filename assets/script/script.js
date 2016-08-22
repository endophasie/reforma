var data = {
	"deck":
	{
		"101":
		{
			"type": "economics",
			"title": "Подушная подать",
			"content": "Обложить налогом мужчин всех сословий, кроме дворянства и духовенства",
			"relation": {
				"needs": "102",
				"contras": "103",
				"union": "102&103",
				"option": "102",
				"vasya": "103"
			},
			"messages": {
				"needs" : "messageID",
				"vasya" : "Ja Vasya!"
			},
			"failMessage": false
		},
		"102":
		{
			"type": "economics",
			"title": "Подворная подать",
			"content": "Собирать налог не с отдельных представителей податных сословий, а с семьи как хозяйствующего субъекта",
			"relation": {
				"needs": "101",
				"union": "101&103",
				"option": "103"
			},
			"failMessage": false
		},
		"103":
		{
			"type": "economics",
			"title": "Пропорциональный подоходный налог",
			"content": "Обложить налогом представителей всех сословий без исключения пропорционально их доходам: чем больше доход, тем выше налог",
			"relation": {
				"contras": "101",
				"union": "102&101",
				"option": "101"
			},
			"failMessage": {
				"title": "Конфуз вышел, государь!",
				"content": "Все известные попытки введения пропорционального подоходного налога в условиях сословного общества закончились плачевно. В России они, по счастью, вообще не предпринимались вплоть до Первой мировой войны. Что же касается времен Петра I, служилое сословие по традиции рассматривалось как выплачивающее «налог кровью». Церковь, с некоторыми нюансами, была свободна от налогов еще с татаро-монгольских времен. Возложить дополнительное налоговое бремя на богатых купцов означало удушить оживляющуюся внешнюю торговлю и формирующуюся национальную промышленность. Иными словами, введение подоходного налога – слишком решительный шаг в условиях первой четверти XVIII века, который мог закончиться, чем угодно: бунтом, дворянским заговором, но только не победой в Северной войне."
			}
		}
	},
	"messages": {
		"contras": [
			{
				"id": "101102103",
				"content": "Пополнять казну, конечно, можно разными способами, но налоговая система должна базироваться на какой-то одной подати.",
			}
		],
		"cardactivated": [
			{
				"id": "1",
				"cardId": "303",
				"comment": "Заработала В3",
				"content": "Теперь у нас есть и рекруты, годные к воинской службе, и устав, согласно которому эти рекруты будут служить, и офицеры, способные обучить новобранцев военному делу и руководить ими в бою. Наша армия определенно обрела плоть."
			}
		],
		"finalWin": [
			{
				"id": "1",
				"comment": "Вводное слово",
				"title": "Виктория, государь!",
				"content":"Швед разбит, Россия прочно закрепилась на Балтике, прорублено окно в Европу. Наше вымуштрованное войско, вооруженное по последнему слову военной техники и снабженное всем необходимым, отныне является одним из сильнейших в Европе и мире."
			}
		],
		"finalFail": [
			{
				"id": "1",
				"comment": "Вводное слово",
				"title": "Конфуз вышел, государь!",
				"content": "Как разбить шведа, когда "
			}
		]
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


var Reforma = function() {
	var _this = this;
	var deck = data.deck;
	var points = 0;
	var lifes = 2;
	var playDeck = [];
	var playedCards = [];
	var activeCard = '';

	_this.init = function() {

		_this.reset();

		actions();
	};

	_this.reset = function() {
		console.log('reset', 1)
		points = 0;
		lifes = 2;
		playDeck = [];
		playedCards = [];
		activeCard = '';


		if( $('.reforma-desk_base').hasClass('is-hide') ) {
			$('.reforma-desk_base').removeClass('is-hide');
			$('.reforma-desk_game').addClass('is-hide');
		}

		$('.reforma-game_life').removeClass('is-burn');

		$('.js-popup_content-card').empty();

		var infoBlock = $('.reforma-game_info-message');
		var gameBlock = $('.reforma-game_info-action');

		infoBlock.addClass('is-hide');
		gameBlock.removeClass('is-hide');

		$('.reforma_card').remove();

		createCard();
		shuffle(playDeck);
	    setActiveCard();
	    setPoints();
	};

	var createCard = function() {
		var cards = $('.reforma-deck_card');

		for(var key in deck) {
			var cardTagName = '';

			var item = deck[key];
		    if(item.type == 'economics') {
		    	cardTagName += 'Экономика'
		    } else if(item.type == 'social') {
		    	cardTagName += 'Социальная сфера'
		    } else if(item.type == 'war') {
		    	cardTagName += 'Военное дело'
		    }

			var card = $(
			    '  <div class="reforma_card '+ item.type +'" id="'+ key +'">' +
			    '    <div class="reforma-card_tag"><span class="reforma-card_icon"></span>'+ cardTagName +'</div>' +
			    '    <div class="reforma_card-content">' +
			    '		<div class="reforma_card-title">'+ item.title +'</div>' +
			    '		<div class="reforma_card-text">'+ item.content +'</div>' +
			    '  	 </div>' +
			    '  </div>'
			    );

			playDeck.push(key);
	    	cards.prepend(card);
		}
	};

	var setActiveCard = function() {
	    activeCard = $('#'+playDeck[0]);
	    activeCard.addClass('is-active').siblings('.reforma_card').removeClass('is-active');

	    //return activeCard.attr('id');
	};

	var setPoints = function() {
		console.log('setPoints',points);
		var score = $('.reforma-game_score');
		score.text(points);

		if(points == 100) {
			endGame('finish');
		}
	};

	var looseLife = function() {
		var lifeBar = $('.reforma-game_life');

		lifes -= 1;
		console.log('qwe',lifes)


		if(lifes == 1) {
			lifeBar.eq(1).addClass('is-burn');
		}

		if(lifes == 0) {
			lifeBar.eq(0).addClass('is-burn');
			endGame('finish');
		}
	};

	var putOnTable = function(card) {

		activeCard.removeClass('is-active');
    	playDeck.splice( 0, 1 );

		console.log('putOnTable',card)
		var colEconomics = $('.reforma-game_col.is-economy').find('.reforma-game_content');
		var colSocial = $('.reforma-game_col.is-social').find('.reforma-game_content');
		var colWar = $('.reforma-game_col.is-war').find('.reforma-game_content');

		if($('.reforma-desk_game').hasClass('is-hide')) {
			$('.reforma-desk_game').removeClass('is-hide');
			$('.reforma-desk_base').addClass('is-hide');
		}

		if($('#'+card).hasClass('economics')) {
			colEconomics.prepend($('#'+card));
		} else if($('#'+card).hasClass('social')) {
			colSocial.prepend($('#'+card));
		} else if($('#'+card).hasClass('war')) {
			colWar.prepend($('#'+card));
		}

		$('#'+card).addClass('on-desk');

		playedCards.push(card);


    	/*if(playDeck.length == 0) {
    		$('.reforma_deck').addClass('is-hide');
    		endGame();
    	}*/

	};

	var checkPlayedCard = function(card) {

		if (playedCards.length == 0) {
			console.log('first or last?',card)
			putOnTable(card);
		} else {
			var relations = deck[card].relation;

			var isPopupOpened = false;
			if (relations != undefined) {
				for(key in relations) {
					var isTrue = checkRelation(relations[key]);
					var ids = getIds(relations[key]);
					console.log(isTrue,ids)
					if (isTrue) {
						console.log('relations',key)
						switch (key) {
							/*case 'union':
								popup("started-work", card, filterIds(ids));
								break;*/

							case 'needs':
								popup("started-work", card, filterIds(ids));
								points += filterIds(ids).length;
								setPoints();
								isPopupOpened = true;
								break;

							case 'contras':
								popup("conflict", card, filterIds(ids));
								isPopupOpened = true;
								break;

							case 'option':
								/*popup("started-work", card, filterIds(ids));*/
								points += 1;
								setPoints();
								//putOnTable(card);
								break;

							default:
								break;
						}
					}
				}

				var message = deck[card].messages;
				if (message != undefined) {
					console.log('message',message);
				}
			}

			if(!isPopupOpened) {
				putOnTable(card);
			}
		}
	};

	var getIds = function(dataStr) {
		var ids = [];
		var regexp = /(x|\&|\|)/g;

		dataStr.replace(regexp,',$1').split(/,/g).forEach(function(piece) {
            if (!piece.length) {
                return;
            }

            if (piece[0].match(regexp)) {
                id = piece.substr(1);
            } else { // If there's just numbers
                id = piece;
            }
            ids.push(id);
        });

        return ids;
	}

	var checkRelation = function(dataStr) {

		if(!dataStr.length == 0) {
			var result = false;

			var regexp = /(x|\&|\|)/g;

			dataStr.replace(regexp,',$1').split(/,/g).forEach(function(piece) {
				console.log(dataStr)
	            var op = '|',
                	id;

	            if (!piece.length) {
	                return;
	            }

	            // If the first symbol contains an operation
	            if (piece[0].match(regexp)) {
	                op = piece[0];
	                id = piece.substr(1);
	            } else { // If there's just numbers
	                id = piece;
	            }

				if (op == "x") {
					var tmp = hasId(id);
					result = result ? !tmp : tmp;
					//console.log('result1',result,op,id)
				}
				if (op == "&") {
					result &= hasId(id);
					//console.log('result2',result,op,id)
				}
				if (op == "|") {
					result |= hasId(id);
					//console.log('result3',result,op,id)
				}
	        });
			console.log('result-main',result)
			return result;
		}
		return false;
	};

	var filterIds = function(ids) {
		return ids.filter(function(i) {return hasId(i);})
	};

	var hasId = function(id) {
		var found = playedCards.filter(function(i) {
			return i == id;
		});
		return found.length > 0;
	};

	var actions = function() {
		var playCards = $('.reforma_card');

		playCards.on('click', function() {
			var playCardsId = $(this).attr('id');
			popup('card-info',playCardsId);
		});


		// card actions
	    var addCardLink = $('.js-act-add');
	    var skipCardLink = $('.js-act-skip');
	    var removeCardLink = $('.js-act-remove');

	    addCardLink.on('click', function() {
	    	var actId = activeCard.attr('id');

	    	checkPlayedCard(actId);

	    	setActiveCard();
	    });

	    skipCardLink.on('click', function() {
	    	playDeck.push( playDeck.splice( 0, 1 )[0] );
	    	setActiveCard();
	    });

	    removeCardLink.on('click', function() {
	    	playDeck.splice( 0, 1 );
	    	setActiveCard();

	    	if(playDeck.length == 0) {
	    		activeCard.removeClass('is-active');
	    		endGame();
	    	}
	    });
	};

	var endGame = function(finish) {
		if(points >= 100) {
			totalInfo('victory');
		}
		if(points < 100) {
			totalInfo('loose');
		}
		totalInfo(popupType); //remove
	};

	var totalInfo = function(finish) {
		var infoBlock = $('.reforma-game_info-message');
		var gameBlock = $('.reforma-game_info-action');

		infoBlock.removeClass('is-hide').addClass(finish);
		gameBlock.addClass('is-hide');

		$('.reforma-game_info-message-score').text(points);
		//$('.reforma-game_info-message-text').text(finalText);

//		if(finish == victory) {
//			$('.reforma-game_info-message-title-text').text('Победа!');

//		}


		$('.js-popup-info-link').on('click', function() {
			popup('finish',finish);
		});
	};

	var popup = function(popupType,card,ids) {
		var overlay = $('.js-overlay');
		var popupContent = $('.js-popup');
		var close = $('.js-popup-close');
		var popupCard = $('.js-popup_content-card');
		var popupInfoText = $('.js-popup-text');

		popupContent.addClass('is-hide');

		overlay.removeClass('is-hide');
		$('.'+popupType).removeClass('is-hide');

		close.on('click', function() {
			overlay.addClass('is-hide');
			$('.'+popupType).addClass('is-hide');

			popupCard.empty();
		});
		//if (ids == undefined) { ids = []; }
		ids = ids || [];
		console.log('popupData', card,ids)

		$(document).on('keydown', function (e) {
			if(e.which == 27) {
				overlay.addClass('is-hide');
				$('.'+popupType).addClass('is-hide');

				popupCard.empty();
			}
		});

		if(popupType == 'card-info') {
			console.log('this',card)
			$('#'+card).clone().removeClass('on-desk').attr('id', '').prependTo(popupCard);
		}

		if(popupType == 'conflict') {
			popupInfoText.text(data.messages.contras[0].content);
			$('#'+card).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);

			ids.forEach(function(i) {
				$('#'+i).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);
			});

			$('.'+popupType).find('.reforma_card').on('click', function() {

				var cardId = $(this).attr('id');
				var removalCardId = $(this).siblings('.reforma_card').attr('id');

				cardInd = playedCards.indexOf(removalCardId);
				if (cardInd > -1) {
				    playedCards.splice(cardInd, 1);
				}
				putOnTable(cardId);
				$('#'+removalCardId).remove();
	    		setActiveCard();

				overlay.addClass('is-hide');
				$('.'+popupType).addClass('is-hide');
				popupCard.empty();
				console.log('conflictClick',$(this))
			});
		}

		if(popupType == 'started-work') {
			var newCard = '<div class="reforma-popup_wrap">'+
								 '    <div class="reforma-popup_par-extra">'+deck[card].title+'</div>'+ // active card title
								 '	  <div class="reforma-popup_par">'+data.messages.cardactivated[0].content+'</div>'+
								 '</div>';
				popupCard.prepend(newCard);

			ids.forEach(function(i) {
				var newReforma = '<div class="reforma-popup_wrap">'+
								 '    <div class="reforma-popup_par-extra">'+deck[i].title+'</div>'+ // active card title
								 '	  <div class="reforma-popup_par">'+data.messages.cardactivated[0].content+'</div>'+
								 '</div>';
				popupCard.prepend(newReforma);

			});
			putOnTable(card);
		}

		if(popupType == 'lost-life') {
			var cardInfo = '<div class="reforma-popup_wrap">'+
							 '	  <div class="reforma-popup_par">'+card+'</div>'+
							 '</div>';
			popupCard.prepend(cardInfo);
		}
	};

	var contentVictory = function() {

	}
};

$(document).ready(function() {
	var $start = $('.js-reforma-start');

	var reforma = new Reforma();
	reforma.init();

	$start.on('click', function(e) {
		e.preventDefault();
		reforma.reset();
	});
});