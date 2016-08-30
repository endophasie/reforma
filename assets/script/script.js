var data = null;

function ajax() {
    return $.getJSON('data.json');
}

ajax().done(function(result) {
    data = result;

    var $start = $('.js-reforma-start');

	var reforma = new Reforma();
	reforma.init();

	$start.on('click', function(e) {
		e.preventDefault();
		reforma.reset();
	});

});

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

		$('.reforma-deck_card').removeClass('is-end is-ending');

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

		var playCards = $('.reforma_card');

		playCards.on('click', showCardInfo);
	};

	var showCardInfo = function() {
		console.log($(this))
		if($(this).hasClass('on-desk') || $(this).closest('.reforma-popup_card-content')) {
			var playCardId = $(this).attr('id');

			if($(this).hasClass('is-act') && deck[playCardId].relation['needs'] == undefined) {
				var isActive = true;

				popupInfo(playCardId, isActive);

			} else if ($(this).hasClass('is-act') && deck[playCardId].relation['needs'] != undefined) {
				var isActive = true;
				var ids = getIds(deck[playCardId].relation['needs']);
				var unionCards = filterIds(ids);

				popupInfo(playCardId, isActive, unionCards);

			} else {
				popupInfo(playCardId);
			}
		}
	};

	var setActiveCard = function() {
	    activeCard = $('#'+playDeck[0]);
	    activeCard.addClass('is-active').siblings('.reforma_card').removeClass('is-active zoomOutLeft zoomOutRight');

	    //return activeCard.attr('id');
	};

	var setPoints = function() {
		var score = $('.reforma-game_score');
		score.text(points);

		if(points >= 10) {
			totalInfo('total-victory');
		}
	};

	var looseLife = function(card) {
		var lifeBar = $('.reforma-game_life');

		lifes -= 1;
		playDeck.splice( 0, 1 );
		setActiveCard();

		if(lifes == 1) {
			lifeBar.eq(1).addClass('is-burn');
			popupLostLife(card);
		}

		if(lifes == 0) {
			var isLast = true;
			lifeBar.eq(0).addClass('is-burn');
			popupLostLife(card, isLast);
			totalInfo('total-defeat');
		}
	};

	var putOnTable = function(card) {

		activeCard.removeClass('is-active');
    	playDeck.splice( 0, 1 );

    	if (!hasId(card)) {
			playedCards.push(card);
    	}

		if(playedCards.length > 0) {
			for(var i = 0; i<playedCards.length - 1; i++) {
				checkPlayedCard(playedCards[i], true);
			}
		}

		if(deck[card].relation != undefined && deck[card].relation['needs'] == undefined && !$('#'+card).hasClass('is-act')) {
			$('#'+card).addClass('is-act');
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

    	if(playDeck.length == 0) {
    		//$('.reforma_deck').addClass('is-hide');
    		endGame();
    	}

	};

	var checkPlayedCard = function(card, needsOnly) {

		if (playedCards.length == 0) {
			putOnTable(card);
		} else {
			var relations = deck[card].relation;
			var messages = deck[card].messages;

			var isPopupOpened = false;
			if (relations != undefined) {
				for(key in relations) {
					if(needsOnly && key != 'needs'){
						continue;
					}
					var isTrue = checkRelation(relations[key]);
					var ids = getIds(relations[key]);
					var messagesKey = messages[key];
					var message = [];

					if (isTrue) {

						for(j in messagesKey) {
							filterIds(ids).forEach(function(i) {
								if(i == j) {
									message.push(i);
								}
							});
						}

						switch (key) {
							case 'needs':
									console.log('card needs',card, deck[card].relation.needs,$('#'+card).hasClass('is-act'))
								if(!$('#'+card).hasClass('is-act')) {
									popupCardActivate(card, filterIds(ids),message);
									$('#'+card).addClass('is-act');
									points += filterIds(ids).length;
									setPoints();
								} else if(ids.filter(function(i) {return i == card}).length > 0) {
									points++;
									setPoints();
								}

								break;

							case 'conflict':
								console.log('card conflict',card, deck[card].relation.conflict)
								popupConflict(card, filterIds(ids),message);
								isPopupOpened = true;
								break;

							case 'option':
								points += 1;
								setPoints();
								break;

							default:
								break;
						}
					}
				}
			}

			if(!isPopupOpened && !hasId(card) && !deck[card].failMessage) {
				putOnTable(card);
			}

			if(deck[card].failMessage) {
				looseLife(card);
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
				}
				if (op == "&") {
					result &= hasId(id);
				}
				if (op == "|") {
					result |= hasId(id);
				}
	        });
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

		// card actions
	    var addCardLink = $('.js-act-add');
	    var skipCardLink = $('.js-act-skip');
	    var removeCardLink = $('.js-act-remove');

	    addCardLink.on('click', function() {
	    	checkPlayDeck();
	    	var actId = activeCard.attr('id');
	    	checkPlayedCard(actId);
	    	setActiveCard();
	    });

	    skipCardLink.on('click', function() {
	    	$('.reforma_card.is-active').addClass('zoomOutLeft');
	    	setTimeout(function() {
		    	playDeck.push( playDeck.splice( 0, 1 )[0] );
		    	setActiveCard();
		    	checkPlayDeck();
	    	},1000);
	    });

	    removeCardLink.on('click', function() {
	    	$('.reforma_card.is-active').addClass('zoomOutRight');
	    	setTimeout(function() {
		    	playDeck.splice( 0, 1 );
		    	setActiveCard();
		    	checkPlayDeck();
	    	},700);
	    });
	};

	var checkPlayDeck = function() {
		var cards = $('.reforma-deck_card');

		if(playDeck.length == 2) {
    		cards.addClass('is-ending');
    	} else if(playDeck.length == 1) {
    		cards.addClass('is-end').removeClass('is-ending');
    	} else if(playDeck.length == 0) {
    		activeCard.removeClass('is-active');
    		endGame();
    	}
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

	var popupInfo = function(card,isActive,ids) {
		var popupCard = $('.card-info').find('.js-popup_content-card');
		var popupContent = $('.card-info.js-popup');
		var unionCardContent = $('.card-info').find('.reforma-popup_card-wrap');

		popupCard.empty();
		popup('card-info',isActive);
		ids = ids || [];

		$('#'+card).clone().removeClass('on-desk').attr('id', '').prependTo(popupCard);

		ids.forEach(function(i) {
			$('#'+i).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(unionCardContent);
		});

		if(isActive) {
			popupContent.addClass('card-active');
		} else {
			popupContent.removeClass('card-active');
		}

		if(ids.length > 0) {
			popupContent.addClass('card-active-cards');
		} else {
			popupContent.removeClass('card-active-cards');
		}

		unionCardContent.find('.reforma_card').on('click', showCardInfo);
	};

	var popupConflict = function(card,ids,message) {
		var popupCard = $('.conflict').find('.js-popup_content-card');
		var popupInfoText = $('.conflict').find('.js-popup-text');

		popup('conflict');

		message.forEach(function(i) {
			var val = deck[card].messages.conflict[i];
			popupInfoText.text(data.content[val]);
		});

		$('#'+card).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);

		if(ids[0]) {
			$('#'+ids[0]).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);
		}

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
			//checkPlayedCard(cardId);
			putOnTable(cardId);
    		setActiveCard();
		});
	};

	var popupCardActivate = function(card,ids,message) {
		var needsMess;

		message.forEach(function(i) {
			var val = deck[card].messages.needs[i];
			needsMess = data.content[val];
		});
		var popupCard = $('.started-work').find('.js-popup_content-card');
		var newCard = '<div class="reforma-popup_wrap">'+
					  '    <div class="reforma-popup_par-extra">'+deck[card].title+'</div>'+
					  '	  <div class="reforma-popup_par">'+needsMess+'</div>'+
					  '</div>';

		popup('started-work');
		popupCard.prepend(newCard);
		ids = ids || [];

		ids.forEach(function(i) {
			var newReforma = '<div class="reforma-popup_wrap">'+
							 '    <div class="reforma-popup_par-extra">'+deck[i].title+'</div>'+
							 '	  <div class="reforma-popup_par">'+ needsMess +'</div>'+
							 '</div>';


		});
	};

	var popupLostLife = function(card, isLast) {
		var popupCard = $('.lost-life').find('.js-popup_content-card');
		var cardInfo =  '<div class="reforma-popup_wrap">'+
						'	  <div class="reforma-popup_par">'+deck[card].failMessage.content+'</div>'+
						'</div>';

		popup('lost-life');
		popupCard.prepend(cardInfo);

		if(isLast) {
			popupCard.next('.reforma-popup_par.is-info').addClass('is-hide');
		} else {
			popupCard.next('.reforma-popup_par.is-info').removeClass('is-hide');
		}
	};

	var popupFinish = function(finish) {
		var popupContent = $('.finish.js-popup');
		var popupTitleText;
		var popupTitle = $('.finish .reforma-popup_title');
		var popupTextContainer = popupContent.find('.reforma-popup_wrap');

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

		function addText(cardsMessage,container) {
			console.log(container)
			if('cardInfo') {
				container = '<div class="reforma-popup_par">'+ cardsMessage +'</div>';
				console.log('simple')
			} else if('cardInfoExtra') {
				container = '<div class="reforma-popup_par-extra">'+ cardsMessage +'</div>';
				console.log('bold')
			}

			popupTextContainer.append(container);
		}

		if(finish == 'total-victory') {
			if(playedCards.indexOf('303') > 0 && playedCards.indexOf('312') > 0 && playedCards.indexOf('310') > 0 && playedCards.indexOf('311') > 0) {
				cardsMessage = data.messages.finalWin[0].content;
				addText(cardsMessage,'cardInfo');
			} else {
				cardsMessage = data.messages.finalWin[1].content;
				addText(cardsMessage,'cardInfoExtra');

				if (playedCards.indexOf('107') < 0){
					cardsMessage = data.messages.finalWin[2].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('108') > 0 && playedCards.indexOf('210') < 0){
					cardsMessage = data.messages.finalWin[3].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('106') < 0 || playedCards.indexOf('109') > 0){
					cardsMessage = data.messages.finalWin[4].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('111') > 0 && playedCards.indexOf('210') < 0 && playedCards.indexOf('211') < 0){
					cardsMessage = data.messages.finalWin[5].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('311') > 0 && playedCards.indexOf('310') < 0){
					cardsMessage = data.messages.finalWin[6].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('311') > 0 && playedCards.indexOf('310') > 0){
					cardsMessage = data.messages.finalWin[7].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('211') > 0){
					cardsMessage = data.messages.finalWin[8].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('209') > 0){
					cardsMessage = data.messages.finalWin[9].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('110') < 0 || playedCards.indexOf('111') < 0){
					cardsMessage = data.messages.finalWin[10].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('110') < 0 && playedCards.indexOf('111') > 0) {
					cardsMessage = data.messages.finalWin[11].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('111') < 0 && playedCards.indexOf('110') > 0){
					cardsMessage = data.messages.finalWin[12].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('304') > 0){
					cardsMessage = data.messages.finalWin[13].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('302') < 0){
					cardsMessage = data.messages.finalWin[14].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('208') < 0){
					cardsMessage = data.messages.finalWin[15].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('104') > 0 && playedCards.indexOf('107') < 0){
					cardsMessage = data.messages.finalWin[16].content;
					addText(cardsMessage,'cardInfo');
				}

				cardsMessage = data.messages.finalWin[17].content;
				addText(cardsMessage,'cardInfoExtra');
			}
		} else if(finish == 'total-loose') {
			cardsMessage = data.messages.finalFail[0].content;
			addText(cardsMessage,'cardInfo');

			if(playedCards.indexOf('303') < 0) {
				cardsMessage = data.messages.finalFail[1].content;
				addText(cardsMessage,'cardInfo');
			} else if (playedCards.indexOf('312') < 0) {
				cardsMessage = data.messages.finalFail[3].content;
				addText(cardsMessage,'cardInfo');
			} else if (playedCards.indexOf('310') < 0 && playedCards.indexOf('311') < 0) {
				cardsMessage = data.messages.finalFail[2].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('303') > 0 && !$('#303').hasClass('is-act')) {
				if (playedCards.indexOf('306') > 0) {
					cardsMessage = data.messages.finalFail[4].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('307') < 0 && playedCards.indexOf('306') < 0) {
					cardsMessage = data.messages.finalFail[5].content;
					addText(cardsMessage,'cardInfo');
				}
			}

			if (playedCards.indexOf('312') > 0 && !$('#312').hasClass('is-act')) {
				if (playedCards.indexOf('101') < 0) {
					cardsMessage = data.messages.finalFail[6].content;
					addText(cardsMessage,'cardInfo');

					if (playedCards.indexOf('101') < 0 && playedCards.indexOf('102') < 0) {
						cardsMessage = data.messages.finalFail[7].content;
						addText(cardsMessage,'cardInfo');
					}

					if (playedCards.indexOf('101') < 0 && playedCards.indexOf('102') > 0) {
						cardsMessage = data.messages.finalFail[8].content;
						addText(cardsMessage,'cardInfo');
					}
				}
			}

			if (playedCards.indexOf('202') > 0 && !$('#202').hasClass('is-act')) {
				if (playedCards.indexOf('107') < 0 && playedCards.indexOf('106') < 0 && playedCards.indexOf('311') < 0) {
					cardsMessage = data.messages.finalFail[9].content;
					addText(cardsMessage,'cardInfo');
				}
				if ( ($('#106').hasClass('is-act') ? !$('#107').hasClass('is-act') : $('#107').hasClass('is-act') ) && playedCards.indexOf('202') < 0) {
					cardsMessage = data.messages.finalFail[10].content;
					addText(cardsMessage,'cardInfo');
				}
				if ($('#106').hasClass('is-act') && playedCards.indexOf('107') < 0) {
					cardsMessage = data.messages.finalFail[11].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('106') > 0 && playedCards.indexOf('210') < 0) {
					cardsMessage = data.messages.finalFail[12].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('107') > 0 && playedCards.indexOf('106') < 0 && playedCards.indexOf('101') < 0 && playedCards.indexOf('110') < 0 && (playedCards.indexOf('111') < 0 || !$('#107').hasClass('is-act')) ) {
					cardsMessage = data.messages.finalFail[13].content;
					addText(cardsMessage,'cardInfo');

					if (playedCards.indexOf('102') > 0 && playedCards.indexOf('312') < 0) {
						cardsMessage = data.messages.finalFail[14].content;
						addText(cardsMessage,'cardInfo');
					}

					cardsMessage = data.messages.finalFail[15].content;
					addText(cardsMessage,'cardInfo');
				}

				if (playedCards.indexOf('111') > 0 && playedCards.indexOf('101') < 0 && playedCards.indexOf('110') < 0) {
					cardsMessage = data.messages.finalFail[16].content;
					addText(cardsMessage,'cardInfo');
				}
			}

			if (playedCards.indexOf('311') > 0 && !$('#311').hasClass('is-act') && playedCards.indexOf('310') < 0) {
				if (playedCards.indexOf('105') < 0) {
					cardsMessage = data.messages.finalFail[17].content;
					addText(cardsMessage,'cardInfo');
				}
			}

			if (playedCards.indexOf('310') > 0 && !$('#310').hasClass('is-act') && $('#202').hasClass('is-act') && playedCards.indexOf('311') < 0) {
				if (playedCards.indexOf('112') < 0) {
					cardsMessage = data.messages.finalFail[18].content;
					addText(cardsMessage,'cardInfo');
				}
			}

			if (playedCards.indexOf('313') > 0) {
				cardsMessage = data.messages.finalFail[19].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('303') > 0 && playedCards.indexOf('307') > 0 && playedCards.indexOf('304') < 0 && playedCards.indexOf('314') < 0) {
				cardsMessage = data.messages.finalFail[20].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('303') > 0 && playedCards.indexOf('307') > 0 && playedCards.indexOf('301') < 0) {
				cardsMessage = data.messages.finalFail[21].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('314') > 0 && !$('#314').hasClass('is-act')) {
				cardsMessage = data.messages.finalFail[22].content;
				addText(cardsMessage,'cardInfo');

				if (playedCards.indexOf('305') < 0 && playedCards.indexOf('304') < 0) {
					cardsMessage = data.messages.finalFail[23].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('302') < 0) {
					cardsMessage = data.messages.finalFail[24].content;
					addText(cardsMessage,'cardInfo');

					if (playedCards.indexOf('302') < 0 && playedCards.indexOf('304') > 0) {
						cardsMessage = data.messages.finalFail[25].content;
						addText(cardsMessage,'cardInfo');
					}
					if (playedCards.indexOf('302') < 0 && playedCards.indexOf('305') > 0) {
						cardsMessage = data.messages.finalFail[26].content;
						addText(cardsMessage,'cardInfo');
					}

					cardsMessage = data.messages.finalFail[27].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('204') < 0) {
					cardsMessage = data.messages.finalFail[28].content;
					addText(cardsMessage,'cardInfo');
				}
				if (playedCards.indexOf('206') < 0) {
					cardsMessage = data.messages.finalFail[29].content;
					addText(cardsMessage,'cardInfo');
				}
			}
		}

		//popupCard.prepend(cardInfo);
	};
};
