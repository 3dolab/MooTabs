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
	bounce: true,
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

	this.windowHeight = this.contentsElement.getSize().y;
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
	contentsWindow.setStyles({ height: this.windowHeight, 'overflow-x': 'hidden', 'overflow-y': 'visible'});

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
            //if (tab != this.activeTab) {
		new Event(e).stop();
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
		
		if (this.options.loop = true){
			if (i >= this.currentIndex){
			  //dir forward
			    var gap = i - this.currentIndex;
			    var step;
			    for (step = 1; step <= gap; step++){
				var firstmargin = this.contentsElement.getLast('li').getStyle('margin-left').toInt();
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
				this.contentsElement.getFirst('li').inject(this.contentsElement, 'bottom');
				this.contentsElement.getLast('li').clone().inject(this.contentsElement, 'top');
				if (this.currentPosition >= 0)
				  this.contentsElement.getLast('li').setStyle('margin-left', firstmargin+d);
				else if (this.currentPosition < 0)
				  this.contentsElement.getLast('li').setStyle('margin-left', 0);
			    }
			} else if (i < this.currentIndex){
			  //dir backward
			    var gap = this.currentIndex - i;
			    var step;
			    for (step = 1; step <= gap; step++){
				var firstmargin = this.contentsElement.getFirst('li').getStyle('margin-left').toInt();
				if (this.currentPosition > 0)
				  this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
				this.contentsElement.getLast('li').inject(this.contentsElement, 'top');
				this.contentsElement.getFirst('li').clone().inject(this.contentsElement, 'bottom');
				this.contentsElement.getFirst('li').setStyle('margin-left', firstmargin+d);
				if (this.currentPosition <= 0)
				 this.contentsElement.getFirst('li').getNext('li').setStyle('margin-left', 0);
			    }
			 } 
		}
		
		var initialWidth = this.initialWidth;
		var currentPos = this.currentPosition;
		var tabsContainer = this.contentsElement;
		
                this.slideFx.start({
                        left: this.currentPosition + 'px'
		}).chain(function() {
		    if (this.options.loop = true){
		      if (i >= this.currentIndex){
			  //dir forward
			var gap = i - this.currentIndex;
			var step;
			for (step = 1; step <= gap; step++){
			    tabsContainer.getFirst('li').dispose();
			}
			tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
		      } else if (i < this.currentIndex){
			  //dir backward
			var gap = this.currentIndex - i;
			var step;
			for (step = 1; step <= gap; step++){
			    tabsContainer.getLast('li').dispose();
			}
			tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
			if (currentPos <= 0){
				if (tabsContainer.getStyle('width').toInt() > initialWidth)
					tabsContainer.setStyle('width', (tabsContainer.getStyle('width').toInt()+d));
				else
					tabsContainer.setStyle('width', initialWidth);
			}
		      }
		    }
		});
		
		
                this.currentIndex = i;
                this.fireEvent('change', [tab, contents]);
            //} //END ACTIVE TAB
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
	  //alert(this.currentIndex);
		if (this.currentIndex == this.tabsList.length-1)
			this.step(this.tabsList[0], this.contentsList, 0,'forward');
		else
			this.step(this.tabsList[this.currentIndex+1], this.contentsList, this.currentIndex+1,'forward');
		return this;
	}
        if (this.currentIndex == this.tabsCount-1) {
	    if (this.options.bounce != false)
		this.tabsList[0].fireEvent('mousedown');
        } else {
		this.tabsList[this.currentIndex+1].fireEvent('mousedown');
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
	    this.tabsList[this.tabsCount-1].fireEvent('mousedown');
        } else this.tabsList[this.currentIndex-1].fireEvent('mousedown');
        return this;
    },

    step:  function(tab, contentlist, i, direction) {
	this.stop();
	this.activeTab.removeClass(this.options.activeClass);
	this.activeTab = tab;
	this.activeTab.addClass(this.options.activeClass);
	if (direction == 'forward') {
		var d = this.windowWidth;
		this.currentPosition -= d;
		var firstmargin = this.contentsElement.getLast('li').getStyle('margin-left').toInt();
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
		this.contentsElement.getFirst('li').inject(this.contentsElement, 'bottom');
		this.contentsElement.getLast('li').clone().inject(this.contentsElement, 'top');
		if (this.currentPosition >= 0)
		  this.contentsElement.getLast('li').setStyle('margin-left', firstmargin+d);
		else if (this.currentPosition < 0)
		  this.contentsElement.getLast('li').setStyle('margin-left', 0);
	} else if (direction == 'backward'){
	  	var d = -this.windowWidth;
		this.currentPosition -= d;
		var firstmargin = this.contentsElement.getFirst('li').getStyle('margin-left').toInt();
		if (this.currentPosition > 0)
		  this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()-d));
		this.contentsElement.getLast('li').inject(this.contentsElement, 'top');
		this.contentsElement.getFirst('li').clone().inject(this.contentsElement, 'bottom');
		this.contentsElement.getFirst('li').setStyle('margin-left', firstmargin+d);
		if (this.currentPosition <= 0)
		  this.contentsElement.getFirst('li').getNext('li').setStyle('margin-left', 0);	      
	}
	var initialWidth = this.initialWidth;
	var currentPos = this.currentPosition;
	var tabsContainer = this.contentsElement;
	
	this.slideFx.start({
                        left: this.currentPosition + 'px'
	}).chain(function() {
		if (direction == 'forward') {
			tabsContainer.getFirst('li').dispose();
			tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
		} else if (direction == 'backward'){
			tabsContainer.getLast('li').dispose();
			tabsContainer.getFirst('li').setStyle('margin-left', -currentPos);
			if (currentPos <= 0){
				if (tabsContainer.getStyle('width').toInt() > initialWidth)
					tabsContainer.setStyle('width', (tabsContainer.getStyle('width').toInt()+d));
				else
					tabsContainer.setStyle('width', initialWidth);
			}
		
		}
	});
	this.currentIndex = i;
        this.fireEvent('change', [tab, contentlist[i]]);
        return this;
    }
});