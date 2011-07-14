/*
---
description: A plugin for creating tab panes that provide great effect using Mootools

license: MIT-style

authors:
- Nayaab Akhtar

requires:
  core/1.2.1: '*'

provides: [MooTabs]

...
*/

var MooTabs = new Class({

    Implements: [Options, Events],

    options: {
        startIndex: 0,
        activeClass: 'active',
        windowClass: 'contentsWindow',
        fps: 120,
        duration: 400,
        transition: 'expo:in:out',
        autoPlay: true,
        autoPlayWait: 10000,
        totalTabs: 1,
	loop: false
    },

    initialize: function(tabs, contents, options) {
        this.setOptions(options);

        this.tabsElement = tabs[0];
        this.contentsElement = contents[0];
	
	this.initialWidth = this.contentsElement.getStyle('width').toInt();

        this.tabsList = this.tabsElement.getChildren('li');
        this.contentsList = this.contentsElement.getChildren('li');

        this.slideFx = new Fx.Morph(this.contentsElement, {
	    link: 'chain',
            fps : this.options.fps,
            duration: this.options.duration,
            transition: this.options.transition
        });

        this.windowWidth = this.contentsList[0].getSize().x;
        this.currentPosition = -(this.options.startIndex * this.windowWidth);

        this.contentsElement.setStyle('left', this.currentPosition + 'px');
        this.currentIndex = this.options.startIndex;

	this.tabsCount = (this.tabsList.length - this.options.totalTabs + 1);

        this.activeTab = this.tabsList[this.currentIndex].addClass(this.options.activeClass);
        this.activeContents = this.contentsList[this.currentIndex];

        var contentsWindow = new Element('div', {
            'class': this.options.windowClass
        });

        contentsWindow.inject(this.tabsElement, 'after');
        contentsWindow.grab(this.contentsElement);

        this.tabsList.each(function(tab, i) {
            this.setupTabs(tab, this.contentsList[i], i);
	    //this.contentsList[i].setProperty('id', i);
        }, this);

        if (this.options.autoPlay) {
            this.play();
        }
    },

    setupTabs: function(tab, contents, i) {
        tab.addEvent('mousedown', function(e) {
            if (tab != this.activeTab) {
		//new Event(e).stop();
		this.stop();
                //this.stop().play();
		this.activeTab.removeClass(this.options.activeClass);
		if (this.options.totalTabs !=1){
			if (i < this.tabsCount-1){
				this.activeTab = tab;
			}else {
				this.activeTab = this.tabsList[this.tabsCount-1];
				i = this.tabsCount-1;
			}
		} else {                
			this.activeTab = tab;                
		}
		this.activeTab.addClass(this.options.activeClass);
		var d = (i - this.currentIndex) * this.windowWidth;

		this.currentPosition -= d;
		var currentPos = this.currentPosition;
                this.slideFx.start({
                        left: this.currentPosition + 'px'
                        /*
                }).chain(function() {
		  	    if (this.options.loop = true){
		var tabMargin = tabsContainer.getFirst('li').getStyle('margin-left').toInt();
		alert(tabMargin+d);
		tabsContainer.getFirst('li').dispose();
		tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
		alert('dispose');
		}*/
		});


                this.currentIndex = i;
                this.fireEvent('change', [tab, contents]);
            }
        }.bind(this));
    },

    play: function() {
        this.player = this.nextSlide.periodical(this.options.autoPlayWait, this);
        return this;
    },

    stop: function() {
        $clear(this.player);
        return this;
    },

    reverse: function(){
        this.player = this.previousSlide.periodical(this.options.autoPlayWait, this);
        return this;
    },

    nextSlide: function() {
	if (this.options.loop = true){
		this.forward(this.tabsList[this.currentIndex], this.contentsList, this.currentIndex);
		return this;
	}
        if (this.currentIndex == this.tabsCount-1) {
		this.tabsList[0].fireEvent('mousedown');
        } else {
		this.tabsList[this.currentIndex+1].fireEvent('mousedown');
        }
        return this;
    },

    previousSlide: function() {
	if (this.options.loop = true){
		this.backward(this.tabsList[this.currentIndex], this.contentsList, this.currentIndex);
		return this;
	}
        if (this.currentIndex == 0) this.tabsList[this.tabsCount-1].fireEvent('mousedown');
        else this.tabsList[this.currentIndex-1].fireEvent('mousedown');
        return this;
    },

    forward:  function(tab, contentlist, i) {
	this.stop();
        var d = this.windowWidth;
	this.currentPosition -= d;
	if (this.currentPosition >= 0){
	    if (this.contentsElement.getStyle('width').toInt() > this.initialWidth)
		this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
	    else
		this.contentsElement.setStyle('width', this.initialWidth);
	}else{
		this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()+d));
	}	      
	var firstmargin = this.contentsElement.getLast('li').getStyle('margin-left').toInt();
	if (firstmargin >= 0){
		firstmargin = -d;
	}
	      this.contentsElement.getFirst('li').inject(this.contentsElement, 'bottom');
	      this.contentsElement.getLast('li').clone().inject(this.contentsElement, 'top');
	if (this.currentPosition >= 0)
	      this.contentsElement.getLast('li').setStyle('margin-left', firstmargin+d);
	else if (this.currentPosition < 0)
	      this.contentsElement.getLast('li').setStyle('margin-left', 0);

	      var currentPos = this.currentPosition;
	      var tabsContainer = this.contentsElement;
	this.slideFx.start({
                        left: this.currentPosition + 'px'
		}).chain(function() {
		tabsContainer.getFirst('li').dispose();
		tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
		});

	this.currentIndex = i;
        this.fireEvent('change', [tab, contentlist[i]]);
        return this;
    },
			
    backward:   function(tab, contentlist, i) {
	this.stop();
        var d = -this.windowWidth;
	this.currentPosition -= d;
	      var firstmargin = this.contentsElement.getFirst('li').getStyle('margin-left').toInt();
	if (this.currentPosition > 0){
		this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
	}
	      this.contentsElement.getLast('li').inject(this.contentsElement, 'top');
	      this.contentsElement.getFirst('li').clone().inject(this.contentsElement, 'bottom');
	      this.contentsElement.getFirst('li').setStyle('margin-left', firstmargin+d);
	if (this.currentPosition <= 0)
	      this.contentsElement.getFirst('li').getNext('li').setStyle('margin-left', 0);
  
	      var initialWidth = this.initialWidth;
	      var currentPos = this.currentPosition;
	      var tabsContainer = this.contentsElement;
	this.slideFx.start({
                        left: this.currentPosition + 'px'
		}).chain(function() {
		tabsContainer.getLast('li').dispose();
		tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
	if (currentPos <= 0){
	    if (tabsContainer.getStyle('width').toInt() > initialWidth)
		tabsContainer.setStyle('width', (tabsContainer.getStyle('width').toInt()+d));
	    else
		tabsContainer.setStyle('width', initialWidth);
	    }
		});

	this.currentIndex = i;
        this.fireEvent('change', [tab, contentlist[i]]);
        return this;
    },
    backwardbackup:   function(tab, contentlist, i) {
	this.stop();
        var d = -this.windowWidth;
	this.currentPosition -= d;
	      var firstmargin = this.contentsElement.getFirst('li').getStyle('margin-left').toInt();
	if (this.currentPosition > 0){
		this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
	}

	this.contentsElement.getLast('li').setStyle('margin-right', 0);
	this.contentsElement.getLast('li').inject(this.contentsElement, 'top');
	this.contentsElement.getFirst('li').clone().inject(this.contentsElement, 'bottom');
	if (this.currentPosition <= 0)
		this.contentsElement.getFirst('li').setStyle('margin-left', firstmargin+d);
	else
		this.contentsElement.getFirst('li').getNext('li').setStyle('margin-left', 0);
  
	var initialWidth = this.initialWidth;
	var currentPos = this.currentPosition;
	var tabsContainer = this.contentsElement;
	this.slideFx.start({
                        left: this.currentPosition + 'px'
	}).chain(function() {
		tabsContainer.getLast('li').dispose();
		if (currentPos <= 0){
			tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
			if (tabsContainer.getStyle('width').toInt() > initialWidth)
				tabsContainer.setStyle('width', (tabsContainer.getStyle('width').toInt()+d));
			else
				tabsContainer.setStyle('width', initialWidth);
		} else {
			tabsContainer.getLast('li').setStyle('margin-right', currentPos);
		}	    
	});

	this.currentIndex = i;
        this.fireEvent('change', [tab, contentlist[i]]);
        return this;
    }
});