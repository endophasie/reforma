var data = {
	"deck":
	{
		"101":
		{
			"type": "economics",
			"title": "Подушная подать",
			"content": "Обложить одинаковым налогом мужчин всех сословий, кроме дворян и церковников",
			"relation": {
				"conflict": "102|103"
			},
			"messages": {
				"conflict": {
					"102": "Пополнять казну, конечно, можно разными способами, но если заставить людей платить и с души, и с двора, они разорятся.",
					"103": "Налог может быть одинаковым для всех, а может зависеть от дохода, но он не может быть и таким, и другим одновременно; можно обязать платить всех, можно выключить из налогообложения отдельные категории населения, но сделать и то и другое одновременно опять же никак нельзя."
				}
			},
			"failMessage": false
		},
		"102":
		{
			"type": "economics",
			"title": "Подворная подать",
			"content": "Собирать налог не с отдельных представителей податных сословий, а с двора — то есть с крестьянского хозяйства, которое могло объединять несколько семей",
			"relation": {
				"conflict": "101|103"
			},
			"messages": {
				"conflict": {
					"101": "Пополнять казну, конечно, можно разными способами, но если заставить людей платить и с души, и с двора, они разорятся.",
					"103": "Пополнять казну, конечно, можно разными способами, но если заставить людей платить и с души, и с двора, они разорятся."
				}
			},
			"failMessage": false
		},
		"103":
		{
			"type": "economics",
			"title": "Пропорциональный подоходный налог",
			"content": "Обложить налогом представителей всех социальных групп без исключения пропорционально их доходам: чем больше доход, тем выше налог",
			"relation": {
				"conflict": "101|102"
			},
			"messages": {
				"conflict": {
					"102": "Пополнять казну, конечно, можно разными способами, но если заставить людей платить и с души, и с двора, они разорятся.",
					"101": "Налог может быть одинаковым для всех, а может зависеть от дохода, но он не может быть и таким, и другим одновременно; можно обязать платить всех, можно выключить из налогообложения отдельные категории населения, но сделать и то и другое одновременно опять же никак нельзя."
				}
			},
			"failMessage": {
				"title": "Конфуз вышел, государь!",
				"content": "Все известные попытки введения пропорционального подоходного налога в условиях сословного общества закончились плачевно. В России они, по счастью, вообще не предпринимались вплоть до Первой мировой войны. Что же касается времен Петра I, служилое сословие по традиции рассматривалось как выплачивающее «налог кровью». Церковь, с некоторыми нюансами, была свободна от налогов еще с татаро-монгольских времен. Возложить дополнительное налоговое бремя на богатых купцов означало удушить оживляющуюся внешнюю торговлю и формирующуюся национальную промышленность. Иными словами, введение подоходного налога – слишком решительный шаг в условиях первой четверти XVIII века, который мог закончиться, чем угодно: бунтом, дворянским заговором, но только не победой в Северной войне."
			}
		}
	},
	"messages": {
		"conflict": [
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

		if(points >= 100) {
			totalInfo('total-victory');
		}
	};

	var looseLife = function(card) {
		var lifeBar = $('.reforma-game_life');

		lifes -= 1;
		console.log('qwe',lifes)


		if(lifes == 1) {
			lifeBar.eq(1).addClass('is-burn');
			popupLostLife(card);
		}

		if(lifes == 0) {
			lifeBar.eq(0).addClass('is-burn');
			totalInfo('total-defeat');
		}
	};

	var putOnTable = function(card) {

		activeCard.removeClass('is-active');
    	playDeck.splice( 0, 1 );

		if(deck[card].failMessage) {
			looseLife(card);
		}

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

    	if(playDeck.length == 0) {
    		//$('.reforma_deck').addClass('is-hide');
    		endGame();
    	}

	};

	var checkPlayedCard = function(card) {

		if (playedCards.length == 0) {
			console.log('first or last?',card)
			putOnTable(card);
		} else {
			var relations = deck[card].relation;
			var messages = deck[card].messages;

			var isPopupOpened = false;
			if (relations != undefined) {
				for(key in relations) {
					var isTrue = checkRelation(relations[key]);
					var ids = getIds(relations[key]);
					var messagesKey = messages[key];
					var message = [];

					if (isTrue) {

						for(j in messagesKey) {
							filterIds(ids).forEach(function(i) {
								if(i == j) {
									message.push(i);
								} else {
									console.log('wtf')
								}
							});
						}

						console.log('ids',ids)
						console.log('message',message)


						switch (key) {
							/*case 'union':
								popup("started-work", card, filterIds(ids));
								break;*/

							case 'needs':
								popupCardActivate(card, filterIds(ids),message);

								$('#'+card).addClass('is-act');
								points += filterIds(ids).length;
								setPoints();
								isPopupOpened = true;
								break;

							case 'conflict':
								popupConflict(card, filterIds(ids),message);
								isPopupOpened = true;
								break;

							case 'option':
								/*popupCardActivate(card, filterIds(ids));*/
								points += 1;
								setPoints();
								//putOnTable(card);
								break;

							default:
								break;
						}
					}
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
			var playCardId = $(this).attr('id');
			console.log('infoPopupData',playCardId)

			if($(this).hasClass('is-act')) {
				var ids = getIds(deck[playCardId].relation['needs']);
				var unionCards = filterIds(ids);
				var isActive = true;

				popupInfo(playCardId, unionCards, isActive);
				console.log('infoPopupData',playCardId, unionCards, isActive)
			} else {
				popupInfo(playCardId);
			}
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

	var endGame = function() {
		if(points >= 2) {
			totalInfo('total-victory');
		}
		if(points < 1) {
			totalInfo('total-loose');
		}
	};

	var totalInfo = function(finish) {
		var infoBlock = $('.reforma-game_info-message');
		var gameBlock = $('.reforma-game_info-action');

		$('.'+finish).removeClass('is-hide');
		gameBlock.addClass('is-hide');

		$('.js-total-score').text(points);

		$('.js-popup-info-link').on('click', function() {
			popupFinish(finish);
		});
	};

	var popup = function(popupType) {
		var overlay = $('.js-overlay');
		var popupContent = $('.js-popup');
		var close = $('.js-popup-close');
		var popupCard = $('.js-popup_content-card');

		popupContent.addClass('is-hide');

		overlay.removeClass('is-hide');
		$('.'+popupType).removeClass('is-hide');

		close.on('click', function() {
			popupHide(popupType);
		});

		$(document).on('keydown', function (e) {
			if(e.which == 27) {
				popupHide(popupType);
			}
		});
	};

	var popupHide = function(popupType) {
		var overlay = $('.js-overlay');
		var popupContent = $('.'+popupType) || $('.js-popup');
		var popupCard = $('.js-popup_content-card');
		var unionCardContent = $('.reforma-popup_card-wrap');

		overlay.addClass('is-hide');
		popupContent.addClass('is-hide'); // for special popup use popupType
		popupCard.empty();
		unionCardContent.empty();
	};

	var popupInfo = function(card,ids,isActive) {
		var popupCard = $('.card-info').find('.js-popup_content-card');
		var popupContent = $('.card-info.js-popup');
		var unionCardContent = $('.card-info').find('.reforma-popup_card-wrap');

		popup('card-info',isActive);
		ids = ids || [];

		$('#'+card).clone().removeClass('on-desk').attr('id', '').prependTo(popupCard);

		ids.forEach(function(i) {
			$('#'+i).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(unionCardContent);
		});

		console.log('actPopup', isActive)

		if(isActive) {
			popupContent.addClass('card-active');
		} else {
			popupContent.removeClass('card-active');
		}

		unionCardContent.find('.reforma_card').on('click', function() {
			popupCard.empty();

			var playCardId = $(this).attr('id');

			if($(this).hasClass('is-act')) {
				var ids = getIds(deck[playCardId].relation['needs']);
				var unionCards = filterIds(ids);
				var isActive = true;

				popupInfo(playCardId, unionCards, isActive);
			} else {
				popupInfo(playCardId);
			}
		});
	};

	var popupConflict = function(card,ids,message) {
		var popupCard = $('.conflict').find('.js-popup_content-card');
		var popupInfoText = $('.conflict').find('.js-popup-text');

		popup('conflict');
		ids = ids || [];

		popupInfoText.text(deck[card].messages.conflict[message]);
		$('#'+card).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);

		ids.forEach(function(i) {
			$('#'+i).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);
		});

		$('.conflict').find('.reforma_card').on('click', function() {

			var cardId = $(this).attr('id');
			var removalCardId = $(this).siblings('.reforma_card').attr('id');
			var cardInd = playedCards.indexOf(removalCardId);

			if (cardInd > -1) {
			    playedCards.splice(cardInd, 1);
			}
			/*if(!checkPlayedCard(cardId)) {

			}*/
			$('#'+removalCardId).remove();
    		popupHide('conflict');
			checkPlayedCard(cardId);
    		setActiveCard();
		});
	};

	var popupCardActivate = function(card,ids,message) {
		var popupCard = $('.started-work').find('.js-popup_content-card');
		var newCard = '<div class="reforma-popup_wrap">'+
					  '    <div class="reforma-popup_par-extra">'+deck[card].title+'</div>'+
					  '	  <div class="reforma-popup_par">'+deck[card].content+'</div>'+
					  '</div>';

		popup('started-work');
		ids = ids || [];

		popupCard.prepend(newCard);

		ids.forEach(function(i) {
			var newReforma = '<div class="reforma-popup_wrap">'+
							 '    <div class="reforma-popup_par-extra">'+deck[i].title+'</div>'+
							 '	  <div class="reforma-popup_par">'+deck[i].messages.needs[message]+'</div>'+
							 '</div>';

			popupCard.prepend(newReforma);
		});

		putOnTable(card);
	};

	var popupLostLife = function(card) {
		var popupCard = $('.lost-life').find('.js-popup_content-card');
		var cardInfo =  '<div class="reforma-popup_wrap">'+
						'	  <div class="reforma-popup_par">'+deck[card].failMessage.content+'</div>'+
						'</div>';

		popup('lost-life');
		popupCard.prepend(cardInfo);

		//putOnTable(card);
	};

	var popupFinish = function(finish) {
		var popupContent = $('.finish.js-popup');
		/*var cardInfo =  '<div class="reforma-popup_wrap">'+
						'	  <div class="reforma-popup_par">'+deck[card].failMessage.content+'</div>'+
						'</div>';*/
		var popupTitle = $('.finish .reforma-popup_title');
		var popupTitleText;

		popup('finish');

		if(finish == 'total-loose') {
			popupTitleText = 'Вы проиграли';
		} else if(finish == 'total-defeat') {
			popupTitleText = 'У вас бунт, государь';
		} else {
			popupTitleText = 'Виктория, государь!';
		}

		popupContent.addClass(finish);
		popupTitle.text(popupTitleText);

		//popupCard.prepend(cardInfo);
	};
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