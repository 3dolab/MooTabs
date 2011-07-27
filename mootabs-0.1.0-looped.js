/*
---
description: A plugin for creating tab panes that provide great effect using Mootools

license: MIT-style

authors:
- Nayaab Akhtar

fork by:
- 3dolab

requires:
  core/1.2.1: '*'
  
tested with:
  up to MooTools 1.3.2

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
	bounce: true,
	loop: false
    },

    initialize: function(tabs, contents, options) {
        this.setOptions(options);

        this.tabsElement = tabs[0];
        this.contentsElement = contents[0];
	
	this.initialWidth = this.contentsElement.getStyle('width').toInt();

        this.tabsList = this.tabsElement.getChildren();
        this.contentsList = this.contentsElement.getChildren();

        this.slideFx = new Fx.Morph(this.contentsElement, {
	    link: 'chain',
            fps : this.options.fps,
            duration: this.options.duration,
            transition: this.options.transition
        });

	this.windowHeight = this.contentsElement.getSize().y;
	this.contentHeights = new Array();
	this.contentsElement.getChildren().each(function(el,i){ this.contentHeights[i] = el.getSize().y;},this);
	this.windowHeight = Math.max.apply(Math, this.contentHeights);
        this.windowWidth = this.contentsList[0].getSize().x;
        this.currentPosition = -(this.options.startIndex * this.windowWidth);

        this.contentsElement.setStyle('left', this.currentPosition + 'px');
        this.currentIndex = this.options.startIndex;

	this.tabsCount = (this.tabsList.length - this.options.totalTabs + 1);

        this.activeTab = this.tabsList[this.currentIndex].addClass(this.options.activeClass);
        this.activeContents = this.contentsList[this.currentIndex].addClass(this.options.activeClass);

        var contentsWindow = new Element('div', {
            'class': this.options.windowClass
        });
	//contentsWindow.setStyles({ height: this.windowHeight, 'overflow-x': 'hidden', 'overflow-y': 'visible'});
	contentsWindow.setStyles({ height: this.windowHeight });

        contentsWindow.inject(this.tabsElement, 'after');
        contentsWindow.grab(this.contentsElement);

	this.isRunning = false;
        this.tabsList.each(function(tab, i) {
            this.setupTabs(tab, this.contentsList[i], i);
        }, this);

        if (this.options.autoPlay) {
            this.play();
        }
    },

    setupTabs: function(tab, contents, i) {
        tab.addEvent('click', function(e) {
            //if (tab != this.activeTab) {
		e.stop();
		//new Event(e).stop();
		//this.stop();
		this.step(tab, contents, i, 'none');
            //} //END ACTIVE TAB
        }.bind(this));
    },

    play: function() {
        this.player = this.nextSlide.periodical(this.options.autoPlayWait, this);
        return this;
    },

    stop: function() {
        clearInterval(this.player);
        return this;
    },

    reverse: function(){
        this.player = this.previousSlide.periodical(this.options.autoPlayWait, this);
        return this;
    },

    nextSlide: function() {
	if (this.options.loop = true){
		if (this.currentIndex == this.tabsList.length-1)
			this.step(this.tabsList[0], this.contentsList, 0,'forward');
		else
			this.step(this.tabsList[this.currentIndex+1], this.contentsList, this.currentIndex+1,'forward');
		return this;
	}
        if (this.currentIndex == this.tabsCount-1) {
	    if (this.options.bounce != false)
		this.tabsList[0].fireEvent('click');
        } else {
		this.tabsList[this.currentIndex+1].fireEvent('click');
        }
        return this;
    },

    previousSlide: function() {
	if (this.options.loop = true){
		if (this.currentIndex == 0)
			this.step(this.tabsList.getLast(), this.contentsList, this.tabsList.length-1,'backward');
		else
			this.step(this.tabsList[this.currentIndex-1], this.contentsList, this.currentIndex-1,'backward');
		return this;
	}
        if (this.currentIndex == 0){
	  if (this.options.bounce != false)
	    this.tabsList[this.tabsCount-1].fireEvent('click');
        } else this.tabsList[this.currentIndex-1].fireEvent('click');
        return this;
    },

    step:  function(tab, contentlist, i, direction) {
	//this.stop();
		if (this.isRunning)
		  return false;
		this.isRunning = true;
	this.activeTab.removeClass(this.options.activeClass);
	if (this.options.totalTabs != 1){
		if (i < this.tabsCount-1 || this.options.loop == true){
			this.activeTab = tab;
		}else if (this.options.loop != true){
			this.activeTab = this.tabsList[this.tabsCount-1];
			i = this.tabsCount-1;
		}
	} else {                
		this.activeTab = tab;
	}
	this.activeTab.addClass(this.options.activeClass);
	this.contentsElement.getFirst().removeClass(this.options.activeClass);	

	if (direction == 'forward')
		var d = this.windowWidth;
	else if (direction == 'backward')
		var d = -this.windowWidth;
	else
	  	var d = (i - this.currentIndex) * this.windowWidth;
	this.currentPosition -= d;

	var step;
	if (direction == 'forward' || direction == 'backward')
		var gap = 1;
	else if (this.options.loop = true && i >= this.currentIndex)
		var gap = i - this.currentIndex;
	else if (this.options.loop = true && i < this.currentIndex)
	  	var gap = this.currentIndex - i;
	
	for (step = 1; step <= gap; step++){
		if (direction == 'forward' || (this.options.loop = true && i >= this.currentIndex && direction == 'none')){
				var firstmargin = this.contentsElement.getLast().getStyle('margin-left').toInt();
				if (firstmargin >= 0){
					firstmargin = -d;
				}
				if (this.currentPosition >= 0){
					if (this.contentsElement.getStyle('width').toInt() > this.initialWidth)
						this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
					else
						this.contentsElement.setStyle('width', this.initialWidth);
				} else {
					this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()+d));
				}
				if (direction == 'forward'){
					this.contentsElement.getFirst().inject(this.contentsElement, 'bottom');
					this.contentsElement.getLast().clone().inject(this.contentsElement, 'top');
				}else if (this.options.loop = true && i >= this.currentIndex){
				  	this.contentsElement.getChildren()[step-1].inject(this.contentsElement, 'bottom');				
					this.contentsElement.getLast().clone().inject(this.contentsElement.getChildren()[step-1], 'before');
				}
				if (this.currentPosition >= 0)
				  this.contentsElement.getLast().setStyle('margin-left', firstmargin+d/gap);
				else if (this.currentPosition < 0)
				  this.contentsElement.getLast().setStyle('margin-left', 0);
		} else if (direction == 'backward' || (this.options.loop = true && i < this.currentIndex && direction == 'none')){
				var firstmargin = this.contentsElement.getFirst().getStyle('margin-left').toInt();
				if (this.currentPosition > 0)
					this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
				if (direction == 'backward'){
					this.contentsElement.getLast().inject(this.contentsElement, 'top');
					this.contentsElement.getFirst().clone().inject(this.contentsElement, 'bottom');
				}else if (this.options.loop = true && i < this.currentIndex){
					this.contentsElement.getChildren()[this.contentsElement.getChildren().length-step].inject(this.contentsElement, 'top');
					this.contentsElement.getFirst().clone().inject(this.contentsElement.getChildren()[this.contentsElement.getChildren().length-step], 'after');
				}
				this.contentsElement.getFirst().setStyle('margin-left', firstmargin+d/gap);
				if (this.currentPosition <= 0)
					this.contentsElement.getFirst().getNext().setStyle('margin-left', 0);
		}
	
	}
	
	this.slideFx.start({
                        left: this.currentPosition + 'px'
	}).chain(function() {
		if (direction == 'forward' || (this.options.loop = true && i >= this.currentIndex && direction == 'none')){
			for (step = 1; step <= gap; step++){
			    this.contentsElement.getFirst().dispose();
			}
			this.contentsElement.getFirst().setStyle('margin-left', -this.currentPosition);
		} else if (direction == 'backward' || (this.options.loop = true && i < this.currentIndex && direction == 'none')){
			for (step = 1; step <= gap; step++){
			    this.contentsElement.getLast().dispose();
			}
			this.contentsElement.getFirst().setStyle('margin-left', -this.currentPosition);
			if (this.currentPosition <= 0){
				if (this.contentsElement.getStyle('width').toInt() > this.initialWidth)
					this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()+d));
				else
					this.contentsElement.setStyle('width', this.initialWidth);
			}
		}
		this.contentsElement.getFirst().addClass(this.options.activeClass);
		this.currentIndex = i;
		this.fireEvent('change', [tab, contentlist[i]]);
		this.isRunning = false;
	}.bind(this));
        return this;
    }
});