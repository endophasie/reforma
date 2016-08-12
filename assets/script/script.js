var data = {
	"deck":
	[
		{
			"id": "101",
			"type": "economics",
			"title": "Подушная подать",
			"content": "Обложить налогом мужчин всех сословий, кроме дворянства и духовенства",
			"failMessage": false
		},
		{
			"id": "102",
			"type": "economics",
			"title": "Подворная подать",
			"content": "Собирать налог не с отдельных представителей податных сословий, а с семьи как хозяйствующего субъекта",
			"failMessage": false
		},
		{
			"id": "103",
			"type": "economics",
			"title": "Пропорциональный подоходный налог",
			"content": "Обложить налогом представителей всех сословий без исключения пропорционально их доходам: чем больше доход, тем выше налог",
			"failMessage": {
				"title": "Конфуз вышел, государь!",
				"content": "Все известные попытки введения пропорционального подоходного налога в условиях сословного общества закончились плачевно. В России они, по счастью, вообще не предпринимались вплоть до Первой мировой войны. Что же касается времен Петра I, служилое сословие по традиции рассматривалось как выплачивающее «налог кровью». Церковь, с некоторыми нюансами, была свободна от налогов еще с татаро-монгольских времен. Возложить дополнительное налоговое бремя на богатых купцов означало удушить оживляющуюся внешнюю торговлю и формирующуюся национальную промышленность. Иными словами, введение подоходного налога – слишком решительный шаг в условиях первой четверти XVIII века, который мог закончиться, чем угодно: бунтом, дворянским заговором, но только не победой в Северной войне."
			}
		}
	],
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

		shuffle(deck);
		createCard();
	};

	var createCard = function() {
		var cards = $('.reforma-deck_card');

	    for(var i=0; i<deck.length; i++) {
	    	var cardTagName = '';

		    if(deck[i].type == 'economics') {
		    	cardTagName += 'Экономика'
		    } else if(deck[i].type == 'social') {
		    	cardTagName += 'Социальная сфера'
		    } else if(deck[i].type == 'war') {
		    	cardTagName += 'Военное дело'
		    }

			var card = $(
		    '  <div class="reforma_card '+ deck[i].type +'" id="'+ deck[i].id +'">' +
		    '    <div class="reforma-card_tag"><span class="reforma-card_icon"></span>'+ cardTagName +'</div>' +
		    '    <div class="reforma_card-content">' +
		    '		<div class="reforma_card-title">'+ deck[i].title +'</div>' +
		    '		<div class="reforma_card-text">'+ deck[i].content +'</div>' +
		    '  	 </div>' +
		    '  </div>'
		    );

			playDeck.push(deck[i].id);
	    	cards.prepend(card);
	    }

	    setActiveCard();
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

    	if(playDeck.length == 0) {
    		$('.reforma_deck').addClass('is-hide');
    		endGame();
    	}

	};

	var checkPlayedCard = function(card) {


		if (playedCards.length == 0) {
			console.log('first or last?',card)
			putOnTable(card);
		}

		if (card == '101') {
			playedCards.forEach(function(item, i, playedCards) {
				switch(item) {
					case '102':
						popup('conflict',card,'102');
						//console.log('conflict')
						break;
					case '103':
						putOnTable(card);
						popup('started-work',card,'103');
						break;
					//console.log($(popupType))
					/*default:
						console.log(card)
						putOnTable(card);*/
				}
			});
		}

		if (card == '102') {
			playedCards.forEach(function(item, i, playedCards) {
				switch(item) {
					case '101':
						popup('conflict',card,'101');
						break;
					case '103':
						putOnTable(card);
						popup('lost-life',card);
						looseLife();
						break;
					/*default:
						console.log(card)
						putOnTable(card);*/
				}
			});
		}

		if (card == '103') {
			playedCards.forEach(function(item, i, playedCards) {
				switch(item) {
					/*case '102':
						popup('conflict');*/
					case '101':
						putOnTable(card);
						popup('started-work',card,'101');
						break;
					case '102':
						putOnTable(card);
						popup('lost-life',card);
						looseLife();
						break;
					/*default:
						console.log(card)
						putOnTable(card);*/
				}
			});
		}
	};

	var actions = function() {
		var playCards = $('.reforma_card');

		playCards.on('click', function() {
			popup('card-info',this);
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

		if(finish == victory) {
			$('.reforma-game_info-message-title-text').text('Победа!');

		}


		$('.js-popup-info-link').on('click', function() {
			popup('finish',finish);
		});
	};

	var popup = function(popupType,card,nextCard) {
		var overlay = $('.js-overlay');
		var popup = $('.js-popup');
		var close = $('.js-popup-close');
		var popupCard = $('.js-popup_content-card');
		var popupInfoText = $('.js-popup-text');

		popup.addClass('is-hide');

		overlay.removeClass('is-hide');
		$('.'+popupType).removeClass('is-hide');

		close.on('click', function() {
			overlay.addClass('is-hide');
			$('.'+popupType).addClass('is-hide');

			popupCard.empty();
		});

		$(document).on('keydown', function (e) {
			if(e.which == 27) {
				overlay.addClass('is-hide');
				$('.'+popupType).addClass('is-hide');

				popupCard.empty();
			}
		});

		if(popupType == 'card-info') {
			console.log('this',card)
			$(card).clone().removeClass('on-desk').attr('id', '').prependTo(popupCard);
		}

		if(popupType == 'conflict') {
			console.log('conflict',card, nextCard)
			popupInfoText.text(data.messages.contras[0].content);
			$('#'+card).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);
			$('#'+nextCard).clone().removeClass('on-desk').addClass('reforma-deck_card').prependTo(popupCard);

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
			var newReforma = '<div class="reforma-popup_wrap">'+
							 '    <div class="reforma-popup_par-extra">'+deck[0].title+'</div>'+ // active card title
							 '	  <div class="reforma-popup_par">'+data.messages.cardactivated[0].content+'</div>'+
							 '</div>';
			popupCard.prepend(newReforma);
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