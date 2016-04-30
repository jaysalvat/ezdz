Ezdz [izy-dizy]
===============

[![Build Status](https://travis-ci.org/jaysalvat/ezdz.png)](https://travis-ci.org/jaysalvat/ezdz)

Ezdz is a jQuery plugin to turn any standard input type file into a nice drag & drop zone with validators and previews.

Ezdz uses HTML5 [File](http://www.w3.org/TR/FileAPI/), [Drag and Drop](http://www.w3.org/TR/2011/WD-html5-20110525/dnd.html) API, so it works properly on modern browsers only. I've tested it on last version of Chrome, Firefox and Safari on MacOSX and IOS7 safari mobile only. Feedbacks are welcomed.

Demo
----

Ezdz is in an early stage of development. Some demos are coming... Meanwhile please check [a quick demo on Codepen](http://codepen.io/jaysalvat/full/wjFcn).
Here is a **screenshot** — Hey! Don't drag/drop files below, it's just a screenshot!

![screenshot](http://jaysalvat.github.io/ezdz/img/ezdz.png "Ezdz dropzone screenshot")

Getting Started
---------------

Include [jQuery](http://code.jquery.com/jquery.min.js).

    <script src="jquery.min.js"></script>

Include Ezdz styles.

    <link rel="stylesheet" href="ezdz/dist/jquery.ezdz.min.css">

Include Ezdz script.

    <script src="ezdz/dist/jquery.ezdz.min.js"></script>

And apply Ezdz to your inputs type file.

    $('input[type="file"]').ezdz();

Settings
--------

#### className

Add a custom class to the container. By default none.

#### text

Set the dropzone text. By default "drop a file".

#### previewImage

Set if a image preview is displayed when an image is dropped. By default "true".

#### value

Set a link to a previously uploaded file. By default none.
This value can also be set in the element.

```<input type="file" name="file" data-value="img/previously-uploaded-logo.png" />```

#### classes

Ezdz classes. By default they are:

    { classes: {
            main:   'ezdz-dropzone',
            enter:  'ezdz-enter',
            reject: 'ezdz-reject',
            accept: 'ezdz-accept',
            focus:  'ezdz-focus'
        }
    }

#### validators

Ezdz allowed validators. By default they are:

    { validators: {
            maxSize:   null,
            width:     null,
            maxWidth:  null,
            minWidth:  null,
            height:    null,
            maxHeight: null,
            minHeight: null
        }
    }

Self-explanatory I guess.

    $('[type="file"]').ezdz({
        validators: {
            maxWidth: 600,
            maxHeight: 400,
            maxSize: 1000000
        }
    });

#### mime-types

Allowed mime-types are defined in the input tag with a standard ``accept``attribute.

    <input type="file" name="logo" accept="image/png, image/jpeg" />

Callbacks
---------

#### init

Called when the dropzone is built.

#### enter

Called when the dropzone is entered by the mouse.

#### leave

Called when the dropzone is leaved by the mouse.

#### accept

Called when a dropped/added file is added and accepted by validators.

    {   accept: function(file) {
            alert('The file "' + file.name + '" is ok.');
        }
    }

#### reject

Called when a dropped/added file is rejected by validators.

    {   reject: function(file, errors) {
            if (errors.maxWidth || errors.maxHeight) {
                alert('The file "' + file.name + '" is too big.');
            }
        }
    }

#### format

Called before displaying the filename in the preview.

    {   format: function(filename) {
            return filename.uppercase();
        }
    }

#### Default settings

Settings can be set for all instances.

    $.ezdz.default = {
        validators: {
            maxWidth: 600,
            maxHeight: 400,
            maxSize: 1000000
        }
    }

Methods
-------

#### preview

Inject a preview in the dropzone.

    $('[type="file"]').ezdz('preview', 'img/previously-uploaded-logo.png');

Set to ```null``` the preview is removed.

    $('[type="file"]').ezdz('preview', null);

#### options

Get or set the settings.

As a getter:

    var options = $('[type="file"]').ezdz('options');

As a setter:

    $('[type="file"]').ezdz('options', {
        validators: {
            maxSize: 10000
        }
    });

#### destroy

Remove Ezdz from the input and get back to normal.

    $('[type="file"]').ezdz('destroy');

Functions
---------

#### isBrowserCompatible

Check if the browser is compatible with HTML5 api needed by Ezdz.

    if ($.ezdz.isBrowserCompatible() === false) {
        console.log('No ezdz for this browser. Standard input file only.');
    }

License
-------

**The MIT License (MIT)**

Copyright (c) 2016 Jay Salvat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
