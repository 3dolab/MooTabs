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
	loop: true
    },

    initialize: function(tabs, contents, options) {
        this.setOptions(options);

        this.tabsElement = tabs[0];
        this.contentsElement = contents[0];

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
	    this.contentsList[i].setProperty('id', i);
        }, this);

        if (this.options.autoPlay) {
            this.play();
        }
    },

    setupTabs: function(tab, contents, i) {
        tab.addEvent('mousedown', function(e) {
            if (tab != this.activeTab) {
                //this.stop().play();
                this.activeTab.removeClass(this.options.activeClass);
                this.activeTab = tab;
                this.activeTab.addClass(this.options.activeClass);

                var d = (i - this.currentIndex) * this.windowWidth;

                this.currentPosition -= d;
		var currentPos = this.currentPosition;
                this.slideFx.start({
                        left: this.currentPosition + 'px'
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
        var d = this.windowWidth;
	this.currentPosition -= d;

	      this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()+d));
	      this.contentsElement.getFirst('li').setStyle('margin-left', 0);
	      this.contentsElement.getLast('li').setStyle('margin-right', 0);
	      this.contentsElement.getFirst('li').inject(this.contentsElement, 'bottom');
	      this.contentsElement.getFirst('li').setStyle('margin-left', -this.currentPosition);

	this.slideFx.start({
                        left: this.currentPosition + 'px'
		});
	this.currentIndex = i;
        this.fireEvent('change', [tab, contents[i]]);
        return this;
    },
			
    backward:   function(tab, contentlist, i) {
        var d = -this.windowWidth;
	this.currentPosition -= d;

	      this.contentsElement.setStyle('width', (this.contentsElement.getStyle('width').toInt()+d));
	      this.contentsElement.getFirst('li').setStyle('margin-left', 0);
	      this.contentsElement.getLast('li').inject(this.contentsElement, 'top');
	      this.contentsElement.getFirst('li').setStyle('margin-left', -this.currentPosition);

	this.slideFx.start({
                        left: this.currentPosition + 'px'
		});
	this.currentIndex = i;
        this.fireEvent('change', [tab, contents[i]]);
        return this;
    }

});