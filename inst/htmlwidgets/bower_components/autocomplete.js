$(function() {
	
	$.widget( "ui.autocomplete", $.ui.autocomplete, {
		wordLength : 0,
		re : /(\w+)(\W+)/g,
		items: null,
		_create: function() {
				// Some browsers only repeat keydown events, not keypress events,
				// so we use the suppressKeyPress flag to determine if we've already
				// handled the keydown event. #7269
				// Unfortunately the code for & in keypress is the same as the up arrow,
				// so we use the suppressKeyPressRepeat flag to avoid handling keypress
				// events when we know the keydown event was used to modify the
				// search term. #7799
				var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
					nodeName = this.element[ 0 ].nodeName.toLowerCase(),
					isTextarea = nodeName === "textarea",
					isInput = nodeName === "input";

				// Textareas are always multi-line
				// Inputs are always single-line, even if inside a contentEditable element
				// IE also treats inputs as contentEditable
				// All other element types are determined by whether or not they're contentEditable
				this.isMultiLine = isTextarea || !isInput && this._isContentEditable( this.element );

				this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
				this.isNewMenu = true;

				this._addClass( "ui-autocomplete-input" );
				this.element.attr( "autocomplete", "off" );
				
				

				this._on( this.element, {
					keydown: function( event ) {
						if ( this.element.prop( "readOnly" ) ) {
							suppressKeyPress = true;
							suppressInput = true;
							suppressKeyPressRepeat = true;
							return;
						}

						suppressKeyPress = false;
						suppressInput = false;
						suppressKeyPressRepeat = false;
						var keyCode = $.ui.keyCode;
						switch ( event.keyCode ) {
						case keyCode.PAGE_UP:
							suppressKeyPress = true;
							this._move( "previousPage", event );
							break;
						case keyCode.PAGE_DOWN:
							suppressKeyPress = true;
							this._move( "nextPage", event );
							break;
						case keyCode.UP:
							suppressKeyPress = true;
							this._keyEvent( "previous", event );
							break;
						case keyCode.DOWN:
							suppressKeyPress = true;
							this._keyEvent( "next", event );
							break;
						case keyCode.ENTER:

							// when menu is open and has focus
							if ( this.menu.active ) {

								// #6055 - Opera still allows the keypress to occur
								// which causes forms to submit
								suppressKeyPress = true;
								event.preventDefault();
								this.menu.select( event );
							}
							break;
						case keyCode.TAB:
							if ( this.menu.active ) {
								this.menu.select( event );
							}
							break;
						case keyCode.ESCAPE:
							if ( this.menu.element.is( ":visible" ) ) {
								if ( !this.isMultiLine ) {
									this._value( this._value() + this.term );
								}
								this.close( event );

								// Different browsers have different default behavior for escape
								// Single press can mean undo or clear
								// Double press in IE means clear the whole form
								event.preventDefault();
							}
							break;
						case keyCode.SPACE:
							suppressKeyPressRepeat = true;

							// search timeout should be triggered before the input value is changed
							this._searchTimeout( event );
							break;
						default:
							suppressKeyPressRepeat = true;

							 if(this.items != null && this.items.length > 0) {
							  //console.log(this.element.val());
							  var lastWord = this._lastWord(this.element.val());
							  if(lastWord !=null) {
								this._suggest(this._wordFilter(lastWord,this.items));
							  }
						  }
						  var contentHeight = this.element.textareaHelper('height')
						  // Set the textarea to the content height. i.e. expand as we type.
						 $(this).height(contentHeight);
						 var pos = this.element.textareaHelper('caretPos');
						 pos.left += 40;
						  $(".ui-autocomplete:visible").css(pos)
						  
							break;
						}
					},
					keypress: function( event ) {
						if ( suppressKeyPress ) {
							suppressKeyPress = false;
							if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
								event.preventDefault();
							}
							return;
						}
						if ( suppressKeyPressRepeat ) {
							return;
						}

						// Replicate some key handlers to allow them to repeat in Firefox and Opera
						var keyCode = $.ui.keyCode;
						switch ( event.keyCode ) {
						case keyCode.PAGE_UP:
							this._move( "previousPage", event );
							break;
						case keyCode.PAGE_DOWN:
							this._move( "nextPage", event );
							break;
						case keyCode.UP:
							this._keyEvent( "previous", event );
							break;
						case keyCode.DOWN:
							this._keyEvent( "next", event );
							break;
						}
					},
					input: function( event ) {
						if ( suppressInput ) {
							suppressInput = false;
							event.preventDefault();
							return;
						}
						this._searchTimeout( event );
					},
					focus: function() {
						this.selectedItem = null;
						this.previous = this._value();
					},
					blur: function( event ) {
						clearTimeout( this.searching );
						this.close( event );
						this._change( event );
					},
					mouseup: function() {
						
						 var contentHeight = this.element.textareaHelper('height')
						  // Set the textarea to the content height. i.e. expand as we type.
						 $(this).height(contentHeight);
						 var pos = this.element.textareaHelper('caretPos');
						 pos.left += 40;
						  $(".ui-autocomplete:visible").css(pos)
					
					}
				} );

				this._initSource();
				this.menu = $( "<ul>" )
					.appendTo( this._appendTo() )
					.menu( {

						// disable ARIA support, the live region takes care of that
						role: null
					} )
					.hide()

					// Support: IE 11 only, Edge <= 14
					// For other browsers, we preventDefault() on the mousedown event
					// to keep the dropdown from taking focus from the input. This doesn't
					// work for IE/Edge, causing problems with selection and scrolling (#9638)
					// Happily, IE and Edge support an "unselectable" attribute that
					// prevents an element from receiving focus, exactly what we want here.
					.attr( {
						"unselectable": "on"
					} )
					.menu( "instance" );

				this._addClass( this.menu.element, "ui-autocomplete", "ui-front" );
				  var contentHeight = this.element.textareaHelper('height')
				  // Set the textarea to the content height. i.e. expand as we type.
				 $(this).height(contentHeight);
				 var pos = this.element.textareaHelper('caretPos');
				 pos.left += 40;
				  $(".ui-autocomplete:visible").css(pos)
						  
				//this.menu.element.attr('style' , 'position:absolute; left:'+currentMousePos.x + 'px; top:'+currentMousePos.y+'px;');
				this._on( this.menu.element, {
					mousedown: function( event ) {

						// Prevent moving focus out of the text field
						event.preventDefault();
					},
					menufocus: function( event, ui ) {
						var label, item;

						// support: Firefox
						// Prevent accidental activation of menu items in Firefox (#7024 #9118)
						if ( this.isNewMenu ) {
							this.isNewMenu = false;
							if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
								this.menu.blur();

								this.document.one( "mousemove", function() {
									$( event.target ).trigger( event.originalEvent );
								} );

								return;
							}
						}

						item = ui.item.data( "ui-autocomplete-item" );
						if ( false !== this._trigger( "focus", event, { item: item } ) ) {

							// use value to match what will end up in the input, if it was a key event
							/*if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
								this._value( this._value() + item.value );
							}*/
						}

						// Announce the value in the liveRegion
						label = ui.item.attr( "aria-label" ) || item.value;
						if ( label && $.trim( label ).length ) {
							this.liveRegion.children().hide();
							$( "<div>" ).text( label ).appendTo( this.liveRegion );
						}
					},
					menuselect: function( event, ui ) {
						var item = ui.item.data( "ui-autocomplete-item" ),
							previous = this.previous;

						// Only trigger when focus was lost (click on menu)
						if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
							this.element.trigger( "focus" );
							this.previous = previous;

							// #6109 - IE triggers two focus events and the second
							// is asynchronous, so we need to reset the previous
							// term synchronously and asynchronously :-(
							this._delay( function() {
								this.previous = previous;
								this.selectedItem = item;
							} );
						}

						if ( false !== this._trigger( "select", event, { item: item } ) ) {
							var str = this._value().replace(/\w+[^\s]$/,'');
							this._value(str + item.value );
						}

						// reset the term after the select event
						// this allows custom select handling to work properly
						this.term = this._value();

						this.close( event );
						this.selectedItem = item;
					}
				} );

				this.liveRegion = $( "<div>", {
					role: "status",
					"aria-live": "assertive",
					"aria-relevant": "additions"
				} )
					.appendTo( this.document[ 0 ].body );

				this._addClass( this.liveRegion, null, "ui-helper-hidden-accessible" );

				// Turning off autocomplete prevents the browser from remembering the
				// value when navigating through history, so we re-enable autocomplete
				// if the page is unloaded before the widget is destroyed. #7790
				this._on( this.window, {
					beforeunload: function() {
						this.element.removeAttr( "autocomplete" );
					}
				} );
		},
		_suggest: function( items ) {
			var ul = this.menu.element.empty();
			this.items = items;
			this._renderMenu( ul, items );
			this.isNewMenu = true;
			this.menu.refresh();
			this._removeClass( "ui-autocomplete-loading" );
			// Size and position menu
			ul.show();
			this._resizeMenu();
		/*	console.log($.extend( {
				of: this.element
			}, this.options.position ))
			ul.position( $.extend( {
				of: this.element
			}, this.options.position ) );
*/
			 var contentHeight = this.element.textareaHelper('height')
			  // Set the textarea to the content height. i.e. expand as we type.
			 $(this).height(contentHeight);
			 var pos = this.element.textareaHelper('caretPos');
			 pos.left += 40;
			  $(".ui-autocomplete:visible").css(pos)
			  
			if ( this.options.autoFocus ) {
				this.menu.next();
			}

			// Listen for interactions outside of the widget (#6642)
			this._on( this.document, {
				mousedown: "_closeOnClickOutside"
			} );
		},

		search: function( value, event ) {
		value = value != null ? value : this._value();

		// Always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return;
		}
		currLength = this._tokenize(value) 
		if (currLength == 0 ) {
			return this.close( event );
		}
		if (currLength == this.wordLength) {
			return;
		}
		
		if ( this._trigger( "search", event ) === false ) {
			return;
		}
		this.wordLength = this._tokenize(value)
		return this._search( value );
	},
	_tokenize: function(value) {
		words = value.match(this.re)
		if(words!=null)
			return words.length
		return 0
			
	},
	_lastWord: function(str) {
		//console.log(str);
		var strArr = str.match(/\w+[^\W]*$/);
		if(strArr!=null && strArr.length > 0)
			return strArr[0];
		return null;
			
	},
	_wordFilter: function(str,arr) {
		 // optimization
        if ( '' === str ) {
            return arr
        }
        else {
            // create regular expression
           rgxp = new RegExp( str, 'i' )

            results = arr.filter(function ( val ) {
                return null !== val.value.match( rgxp )
            })

            return results
		}
	}
});
 
    $("#topic_title").autocomplete({
        source: function (request, response) {
			$.post("https://hello-world-163508.appspot.com/suggest", request, response).fail(function(error) { 
			$("#topic_title").removeClass( "ui-autocomplete-loading" ); });
		},
        minLength: 2,
        select: function(event, ui) {
            var url = ui.item.id;
        },
      // optional (if other layers overlap autocomplete list)
        open: function(event, ui) {
            $(".ui-autocomplete").css("z-index", 1000);
			 var contentHeight = $('textarea').textareaHelper('height')
						  // Set the textarea to the content height. i.e. expand as we type.
			 $('textarea').height(contentHeight);
			 var pos = $('textarea').textareaHelper('caretPos');
			 pos.left += 40;
			 $(".ui-autocomplete").css(pos);
			
        }
    });
 
});