/* ----------------------------------------------------------------------------
// Ezdz [izy-dizy]
// A jQuery plugin to turn any standard input type file into a nice 
// drag & drop zone with validators and previews. 
// Licensed under the MIT license.
// http://github.com/jaysalvat/ezdz/
// ----------------------------------------------------------------------------
// Copyright (C) 2013 Jay Salvat
// http://jaysalvat.com/
// --------------------------------------------------------------------------*/

(function($) {
    // Default settings
    var defaults = {
        className:     '',
        text:          'Drop a file',
        previewImage:  true,
        value:         null,
        classes: {
            main:      'ezdz-dropzone',
            enter:     'ezdz-enter',
            reject:    'ezdz-reject',
            accept:    'ezdz-accept'
        },
        validators: {
            maxSize:   null,
            width:     null,
            maxWidth:  null,
            minWidth:  null,
            height:    null,
            maxHeight: null,
            minHeight: null
        },
        init:   function() {},
        enter:  function() {},
        leave:  function() {},
        reject: function() {},
        accept: function() {},
        format: function(filename) {
            return filename;
        }
    };

    $.ezdz = function(element, options) {
        var self     = this,
            settings = $.extend(true, {}, defaults, $.ezdz.defaults, options),
            $input   = $(element);

        if (!$input.is('input[type="file"]')) {
            $.error('Ezdz error - Must be apply to inputs type file.');
            return;
        }

        // Stop if not File Api compatible
        if (!(window.File && window.FileList && window.FileReader)) {
            return;
        }

        // Public: Ajoute un fichier à la preview
        self.preview = function(path) {
            var basename   = path.replace(/\\/g,'/').replace( /.*\//, ''),
                formatted  = settings.format(basename),
                $container = $input.closest('div');

            var img = new Image();
            img.src = path;

            // Is an image
            img.onload = function() {
                $container.find('div').html(img);
            };

            // Is not an image
            img.onerror = function() {
                $container.find('div').html('<span>' + formatted + '</span>');
            };

            $container.addClass(settings.classes.accept);
        };

        // Public: Destroy la ezdz
        self.destroy = function() {
            $input.closest('div').replaceWith($input);
            $input.off('*.ezdz');
            $input.data('ezdz', '');
        };

        // Public: Extends settings
        self.options = function(values) {
            $.extend(true, settings, values);
        };

        // private: Init the plugin
        var init = function() {
            var $ezdz = $('<div class="' + settings.classes.main + '" />');

            // Drag and drop events sur ezdz
            $ezdz.on('dragover.ezdz', function(e) {
                $(this).addClass(settings.classes.enter);

                if ($.isFunction(settings.enter)) {
                     settings.enter.apply(this);
                }
            });

            $ezdz.on('dragleave.ezdz', function(e) {
                $(this).removeClass(settings.classes.enter);

                if ($.isFunction(settings.leaved)) {
                    settings.leaved.apply(this);
                }
            });

            // Lorsqu'un fichier est droppé ou ajouté
            $input.on('change.ezdz', function(e) {
                var $input    = $(this),
                    $ezdz = $input.closest('div'),
                    file      = this.files[0];

                // No file, so user has cancelled
                if (!file) {
                    return;
                }

                // Info about the dropped or selected file
                var basename  = file.name.replace(/\\/g,'/').replace( /.*\//, ''),
                    extension = file.name.split('.').pop(),
                    formatted = settings.format(basename);

                file.extension = extension;

                // Teste si le type de fichier est accepté
                var allowed  = $input.attr('accept'),
                    accepted = false;
                    valid    = true;
                    errors   = {
                        'mimeType':  false,
                        'maxSize':   false,
                        'width':     false,
                        'minWidth':  false,
                        'maxWidth':  false,
                        'height':    false,
                        'minHeight': false,
                        'maxHeight': false
                    };

                // Check the accepted MimeTypes of the input file
                if (allowed) {
                    var types = allowed.split(/[,|]/);

                    $.each(types, function(i, type) {
                        type = $.trim(type);

                        if (file.type == type) {
                            accepted = true;
                            return false;
                        }

                        // Mime Type avec wildcards ex. image/*
                        if (type.indexOf('/*') !== false) {
                            var a = type.replace('/*', ''),
                                b = file.type.replace(/(\/.*)$/g, '');

                            if (a === b) {
                                accepted = true;
                                return false;
                            }
                        }
                    });

                    if (accepted === false) {
                        errors.mimeType = true;
                    }
                } else {
                    accepted = true;
                }

                // Clean the accepted/rejected classes
                $ezdz
                    .removeClass(settings.classes.reject)
                    .removeClass(settings.classes.accept);

                // If the Mime Type is not accepted
                if (accepted !== true) {
                    $input.val('');

                    $ezdz.addClass(settings.classes.reject);

                    // trigger the reject callback
                    if ($.isFunction(settings.reject)) {
                         settings.reject.apply($ezdz, [ file, errors ]);
                    }
                    return false;
                }

                // Read the added file
                var reader = new FileReader(file),
                    img    = new Image();

                reader.readAsDataURL(file);

                reader.onload = function(e) {
                    file.data = e.target.result;
                    img.src   = file.data;

                    var isImage = (img.width && img.height);

                    // Validator
                    if (settings.validators.maxSize && file.size > settings.validators.maxSize) {
                        valid = false;
                        errors.maxSize = true;
                    }

                    if (isImage) {
                        file.width  = img.width;
                        file.height = img.height;

                        if (settings.validators.width && img.width != settings.validators.width) {
                            valid = false;
                            errors.width = true;
                        }

                        if (settings.validators.maxWidth && img.width > settings.validators.maxWidth) {
                            valid = false;
                            errors.maxWidth = true;
                        }

                        if (settings.validators.minWidth && img.width < settings.validators.minWidth) {
                            valid = false;
                            errors.minWidth = true;
                        }

                        if (settings.validators.height && img.height != settings.validators.height) {
                            valid = false;
                            errors.height = true;
                        }

                        if (settings.validators.maxHeight && img.height > settings.validators.maxHeight) {
                            valid = false;
                            errors.maxHeight = true;
                        }

                        if (settings.validators.minHeight && img.height < settings.validators.minHeight) {
                            valid = false;
                            errors.minHeight = true;
                        }
                    }

                    // The file is validated, so added to input
                    if (valid === true) {
                        $ezdz.find('img').remove();

                        if (isImage && settings.previewImage === true) {
                            $ezdz.find('div').html($(img).fadeIn());
                        } else {
                            $ezdz.find('div').html('<span>' + formatted + '</span>');
                        }

                        $ezdz.addClass(settings.classes.accept);

                        // Trigger the accept callback
                        if ($.isFunction(settings.accept)) {
                             settings.accept.apply($ezdz, [ file ]);
                        }
                    // The file is invalidated, so rejected
                    } else {
                        $input.val('');

                        $ezdz.addClass(settings.classes.reject);

                        // trigger the reject callback
                        if ($.isFunction(settings.reject)) {
                             settings.reject.apply($ezdz, [ file, errors ]);
                        }
                    }
                };
            });

            // Build the ezdz
            $ezdz.addClass(settings.className);
            $input.wrap($ezdz);
            $input.before('<div>' + settings.text + '</div>');

            // Focus and blur
            $input.on('focus.ezdz', function() {
                $(this).closest('div').addClass(settings.classes.focus);
            });

            $input.on('blur.ezdz', function() {
                $(this).closest('div').removeClass(settings.classes.focus);
            });

            // Preview a file at start if it's defined
            var value = settings.value || $input.data('value');

            if (value) {
                self.preview(value);
            }

            // trigger the init callback
            if ($.isFunction(settings.init)) {
                 settings.init.apply($input.closest('div'), [ value ]);
            }
        };

        init();
    };

    $.fn.ezdz = function(options) {
        var args = arguments;

        return this.each(function() {
            var plugin = $(this).data('ezdz');

            if (!plugin) {
                return $(this).data('ezdz', new $.ezdz(this, options));
            } if (plugin[options]) {
                return plugin[options].apply(this, Array.prototype.slice.call(args, 1));
            } else {
                $.error('Ezdz error - Method ' +  options + ' does not exist.');
            }
        });
    };

    $.ezdz.defaults = defaults;

})(jQuery);
