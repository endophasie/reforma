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
	var newTextTotal = '';

	var changes = {
		"active": [],
		"disactive": [],
		"removed": '',

		"clear": function(){
			this.active.length = 0;
			this.disactive.length = 0;
			this.removed = '';
		}
	};

	_this.init = function() {

		_this.reset();

		actions();
	};

	_this.reset = function() {
		log('reset', 1)
		points = 0;
		lifes = 2;
		playDeck = [];
		playedCards = [];
		activeCard = '';
		newTextTotal = '';


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

		$('.reforma-deck_card').removeClass('is-end is-ending is-hide');

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
		if($(this).hasClass('on-desk') || $(this).closest('.reforma-popup_card-content')) {
			var playCardId = $(this).attr('id');

			if($(this).hasClass('is-act') && (deck[playCardId].relation == undefined || deck[playCardId].relation['needs'] == undefined)) {
				var isActive = true;

				popupInfo(playCardId, isActive);

			} else if ($(this).hasClass('is-act') && deck[playCardId].relation['needs'] != undefined) {
				var isActive = true;
				var ids = getIds(deck[playCardId].relation['needs']);
				var unionCards = filterIds(ids,true);

				popupInfo(playCardId, isActive, unionCards);

			} else {
				popupInfo(playCardId);
			}
		}
	};

	var setActiveCard = function() {
	    activeCard = $('#'+playDeck[0]);
	    activeCard.addClass('is-active').siblings('.reforma_card').removeClass('is-active');
	    //return activeCard.attr('id');
	};

	var setPoints = function() {
		var score = $('.reforma-game_score');
		score.text(points);
	};

	var looseLife = function(card) {
		var lifeBar = $('.reforma-game_life');

		lifes -= 1;
		checkTable();
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

	var log = function (type, text){
		var types = [
			//'needs',
			//'option',
			//'filter',
			//'putOnTable',
			//'points'
			//'points_dis'
		];

		if (types.filter(function(i){return i == type;}).length > 0) {
			console.log(type + ': ', text);
		}

	}

	var putOnTable = function(card) {
		activeCard.removeClass('is-active');

		if(deck[card].failMessage) {
			looseLife(card);
			return false;
		}
		log('putOnTable',card);

    	if (!hasId(card)) {
			playedCards.push(card);
    	}

		if( (deck[card].relation == undefined || deck[card].relation['needs'] == undefined) && !$('#'+card).hasClass('is-act')) {
			$('#'+card).addClass('is-act');
		}


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

		checkTable();
	};

	var checkTable = function() {
		if(playedCards.length > 1) {
			var isContinue = true;
			while (isContinue) {
				for(var i = 0; i < playedCards.length - 1; i++) {
					isContinue = checkPlayedCard(playedCards[i]);
					if (isContinue) {break;}
				}
			}
			points += calculatePoints();
			setPoints();
		}
	}

	var checkPlayedCard = function(card) {

		if (playedCards.length == 0) {
			putOnTable(card);
		} else {
			var relations = deck[card].relation;
			var messages = deck[card].messages;
			var isPopupOpened = false;
			var wasActive = $('#'+card).hasClass('is-act');

			var isChanged = false;

			if (relations != undefined) {
				for(key in relations) {
					var isTrue = checkRelation(relations[key], key != 'conflict');
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
								log('needs',card+ deck[card].relation.needs+wasActive);
								if(!wasActive) {
									popupCardActivate(card, filterIds(ids,true),message);
									$('#'+card).addClass('is-act');

									log('needs', changes.active +' '+ points + $('#'+card));
									changes.active.push(card);
									isChanged = true;
								} /*else if(ids.filter(function(i) {return i == card}).length > 0) {
									points++;
								}*/

								break;

							case 'conflict':
								log('conflict',card, deck[card].relation.conflict);
								popupConflict(card, filterIds(ids),message);
								isPopupOpened = true;
								break;

							case 'option':

								break;

							default:
								break;
						}
					} else {
						if (wasActive) {

							if(key == 'needs') {
								log('needs', card);
								$('#'+card).removeClass('is-act');
								changes.disactive.push(card);
								isChanged = true;
							}

						}
					}
				}
			}

			if(!isPopupOpened && !hasId(card)) {
				putOnTable(card);
			}
			return isChanged;
		}
	};

	var getIds = function(dataStr) {
		if (dataStr == '') { return [];}

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

	var checkRelation = function(dataStr, checkAct) {

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

	            if(checkAct) {

					if (op == "x") {
						var tmp = hasIdAct(id);
						result = result ? !tmp : tmp;
					}
					if (op == "&") {
						result &= hasIdAct(id);
					}
					if (op == "|") {
						result |= hasIdAct(id);
					}
				} else {
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
				}
	        });
			return result;
		}
		return false;
	};

	var filterIds = function(ids, checkAct) {
		if (checkAct) {
			log('filter', ids.filter(function(i) {log('filter', i + ' is active = ' + hasIdAct(i)); return hasIdAct(i);}))
			return ids.filter(function(i) {return hasIdAct(i);})
		} else {
			return ids.filter(function(i) {return hasId(i);})
		}
	};

	var hasId = function(id) {
		var found = playedCards.filter(function(i) {
			return i == id;
		});
		return found.length > 0;
	};

	var hasIdAct = function(id) {
		var found = playedCards.filter(function(i) {
			return (i == id && $('#'+i).hasClass('is-act'));
		});
		return found.length > 0;
	};

	var calculatePoints = function() {
		var pointsDiff = 0;
		var activeCards = filterIds(playedCards, true);


			log('points', 'calculating points');
			log('points', activeCards);
			log('points', changes.active);

		for(var i in changes.active) {
			var activatedId = changes.active[i];
			var activated = deck[activatedId];
			log('points', 'count points for ' + activated + ' card, id = ' + activatedId);
			log('points_', activated);

			var pointsStr = activated.relation.needs + (activated.relation.option ? '|' + activated.relation.option : '');
			//log('points', 'count points for ' + activated + ' card, id = ' + activatedId);
			log('points_', pointsStr);
			log('points', getIds(pointsStr));

			pointsDiff += filterIds(getIds(pointsStr), true).length;
			log('points', pointsDiff);

			for(var j in activeCards) {
				if (activeCards.indexOf(activatedId) > j) {
					var activatedOld = deck[activeCards[j]];
					var cardRelNeeds = (activatedOld.relation && activatedOld.relation.needs) ? activatedOld.relation.needs : '';
					var cardRelOption = (activatedOld.relation && activatedOld.relation.option) ? activatedOld.relation.option : '';

						log('points_', cardRelNeeds);
					if (getIds(cardRelNeeds).indexOf(activatedId) >= 0) {
						pointsDiff ++;
						log('points', 'needs link ' + activeCards[j]);
					}
					if (getIds(cardRelOption).indexOf(activatedId) >= 0) {
						pointsDiff ++;
						log('points', 'option link ' + pointsDiff);
					}
				}

			}
		}

		var earlyActivated = activeCards.filter(function(i){return changes.active.indexOf(i) < 0;});
		earlyActivated = earlyActivated.concat(changes.disactive);
		console.log('earlyActivated', earlyActivated, changes.disactive)
		log('points_dis', 'result ' + pointsDiff);

		for(var i in changes.disactive) {
			var disactivatedId = changes.disactive[i];
			var disactivated = deck[disactivatedId];
			log('points_dis', 'decrement points for card = ' + disactivatedId);
			log('points_dis', disactivated);

			var cardRelNeeds = (disactivated.relation && disactivated.relation.needs) ? disactivated.relation.needs : '';
			var cardRelOption = (disactivated.relation && disactivated.relation.option) ? disactivated.relation.option : '';

			var needs = getIds(cardRelNeeds);

			var getActIds = earlyActivated.filter(function(j) {
				return needs.indexOf(j) >= 0;
			});
			log('points_dis', getActIds);

			pointsDiff -= getActIds.length;

			var options = getIds(cardRelOption);

			getActIds = earlyActivated.filter(function(j) {
				return options.indexOf(j) >= 0;
			});

			log('points_dis', getActIds);

			pointsDiff -= getActIds.length;

			log('points_dis', pointsDiff);
		}

		changes.clear();

					log('points_dis', 'result ' + pointsDiff);
					//log('points', changes);
		return pointsDiff;
	};

	var actions = function() {

		// card actions
	    var addCardLink = $('.js-act-add');
	    var skipCardLink = $('.js-act-skip');
	    var removeCardLink = $('.js-act-remove');
	    var endGame = $('.js-reforma-end');

	    addCardLink.on('click', function() {
    		playDeck.splice( 0, 1 );
	    	checkPlayDeck();
	    	var actId = activeCard.attr('id');
	    	checkPlayedCard(actId);
	    	setActiveCard();
	    });

	    skipCardLink.on('click', function() {
	    	var actId = activeCard.attr('id');
	    	$('#'+actId).addClass('zoomOutLeft');

	    	playDeck.push( playDeck.splice( 0, 1 )[0] );
	    	setActiveCard();

	    	setTimeout(function() { $('#'+actId).removeClass('zoomOutLeft') },1500);
	    });

	    removeCardLink.on('click', function() {
	    	var actId = activeCard.attr('id');
	    	$('#'+actId).addClass('zoomOutRight');

	    	playDeck.splice( 0, 1 );
	    	setActiveCard();
	    	checkPlayDeck();

	    	setTimeout(function() { $('#'+actId).removeClass('zoomOutRight') },1000);
	    });

	    endGame.on('click', function() {
	    	totalInfo();
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
    		cards.addClass('is-hide');
    	}
	};

	var checkVictory = function() {
		var finish;
		var victoryCard = '310x311&303&312';
		var victoryCardIds = getIds(victoryCard);
		var actCards = filterIds(victoryCardIds, true);

		if(checkRelation(victoryCard) && actCards) {
			finish = 'total-victory';
		} else {
			finish = 'total-loose';
		}

		return finish;
	};

	var totalInfo = function(finish) {
		var infoBlock = $('.reforma-game_info-message');
		var gameBlock = $('.reforma-game_info-action');

		if(finish == undefined) {
			finish = checkVictory();
		}

		$('.'+finish).removeClass('is-hide');
		gameBlock.addClass('is-hide');

		if(points == 1 || points == 21 || points == 31) {
			$('.js-total-score').text(points + ' очко');
		} else if(points >= 2 && points <= 4 || points >= 22 && points <= 24 || points >= 32 && points <= 34) {
			$('.js-total-score').text(points + ' очка');
		} else {
			$('.js-total-score').text(points + ' очков');
		}

		if(finish == 'total-loose') {
			var textTotal = $('.total-loose .reforma-game_info-message-text').text();
			newTextTotal = textTotal;

			if(playedCards.indexOf('303') < 0) {
				newTextTotal = newTextTotal += data.messages.finalFail[1].content;
			}
			if((playedCards.indexOf('310') < 0 || playedCards.indexOf('311') < 0) && playedCards.indexOf('303') > 0) {
				newTextTotal = newTextTotal += data.messages.finalFail[2].content;
			} else if((playedCards.indexOf('310') < 0 || playedCards.indexOf('311') < 0) && playedCards.indexOf('303') < 0) {
				newTextTotal = newTextTotal += ', '+data.messages.finalFail[2].content;
			}
			if(playedCards.indexOf('312') < 0 && playedCards.indexOf('303') < 0 || (playedCards.indexOf('310') < 0 || playedCards.indexOf('311') < 0)) {
				newTextTotal = newTextTotal += ', '+data.messages.finalFail[3].content;
			} else {
				newTextTotal = newTextTotal += data.messages.finalFail[3].content;
			}
			newTextTotal = newTextTotal += '?';

			$('.total-loose .reforma-game_info-message-text').text(newTextTotal);
		}

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

		//hideOnClick();
	};

	var hideOnClick = function() {
		var overlay = $('.js-overlay');

		if(!overlay.hasClass('is-hide')) {
			$(document).on('click', function(e) {
					var parentElem = $(e.target).closest('.js-popup');
					console.log(parentElem.get())

				    if(parentElem.length == 0) {
						popupHide();
				    }

			});

			$('.js-popup').on('click', function(e) {
				e.stopPropagation();
			});
		}
	};

	var popupHide = function(popupType) {
		var overlay = $('.js-overlay');
		var popupContent = $('.'+popupType) || $('.js-popup');
		var popupCard = $('.js-popup_content-card');
		var unionCardContent = $('.reforma-popup_card-wrap');

		overlay.addClass('is-hide');
		popupContent.addClass('is-hide');
		popupCard.empty();
		unionCardContent.empty();
	};

	var popupInfo = function(card,isActive,ids) {
		var popupCard = $('.card-info').find('.js-popup_content-card');
		var popupContent = $('.card-info.js-popup');
		var unionCardContent = $('.card-info').find('.reforma-popup_card-wrap');

		popupCard.empty();
		unionCardContent.empty();

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
			    changes.removed = cardInd;
			}
			/*if(!checkPlayedCard(cardId)) {

			}*/
			$('#'+removalCardId).remove();
			changes.disactive.push(removalCardId);
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
		popupCard.append(newCard);
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

		function addText(cardsMessage, container) {
			if(container == 'cardInfo') {
				var contentStr = '<div class="reforma-popup_par">'+ cardsMessage +'</div>';
			} else if(container == 'cardInfoExtra') {
				var contentStr = '<div class="reforma-popup_par-extra">'+ cardsMessage +'</div>';
			}

			popupTextContainer.append(contentStr);
		}

		if(finish == 'total-victory') {
			cardsMessage = data.messages.finalWin[1].content;
			addText(cardsMessage,'cardInfoExtra');

			if (playedCards.indexOf('107') < 0){
				cardsMessage = data.messages.finalWin[2].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('108') > 0 && playedCards.indexOf('210') < 0) {
				cardsMessage = data.messages.finalWin[3].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('106') < 0 || playedCards.indexOf('109') > 0) {
				cardsMessage = data.messages.finalWin[4].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('111') > 0 && playedCards.indexOf('210') < 0 && playedCards.indexOf('211') < 0) {
				cardsMessage = data.messages.finalWin[5].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('311') > 0 && playedCards.indexOf('310') < 0) {
				cardsMessage = data.messages.finalWin[6].content;
				addText(cardsMessage,'cardInfo');
			}

			if (playedCards.indexOf('311') > 0 && playedCards.indexOf('310') > 0) {
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

		if(finish == 'total-loose') {
			if (playedCards.indexOf('303') < 0 && playedCards.indexOf('312') < 0 && playedCards.indexOf('310') < 0 && playedCards.indexOf('311') < 0) {
				cardsMessage = newTextTotal;
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

			cardsMessage = data.messages.finalFail[30].content;
			addText(cardsMessage,'cardInfoExtra');
		}

		//popupCard.prepend(cardInfo);
	};
};
