    var $input, $ezdz, $preview;
    
    QUnit.config.reorder = false;

    $input = $('[type="file"]');
    $input.ezdz();

    $ezdz    = $input.parent('.ezdz-dropzone');
    $preview = $ezdz.find('div');

    test('should change class on focus / blur', function() {
        ok(!$ezdz.hasClass('ezdz-focus'), "has no class ezdz-focus");

        $input.trigger('focus');
        ok($ezdz.hasClass('ezdz-focus'), "has class ezdz-focus");

        $input.trigger('blur');
        ok(!$ezdz.hasClass('ezdz-focus'), "has no class ezdz-focus");
    });

    test('should change class on enter / leave', function() {
        ok(!$ezdz.hasClass('ezdz-enter'), "has no class ezdz-enter");
        
        $input.trigger('dragover');
        ok($ezdz.hasClass('ezdz-enter'), "has class ezdz-enter");

        $input.trigger('dragleave');
        ok(!$ezdz.hasClass('ezdz-enter'), "has no class ezdz-enter");
    });

    test("should be defined on jquery object", function () {
        ok($(document.body).ezdz, "ezdz method is defined");
    });

    test('should create some new elements', function() {
        ok($ezdz.length,    "ezdz container now exists");
        ok($preview.length, "ezdz preview div in container now exists");
    });

    test('should inject an image in the dropzone', function() {
        var imageUrl = 'http://www.google.fr/images/logo.png';
        stop();

        $input.ezdz('preview', imageUrl, function() {
            ok($preview.find('img').length, "has an image preview");

            equal($preview.find('img').attr('src'), imageUrl);

            start();
        });
    });

    test('should inject a file in the dropzone', function() {
        var fileUrl = 'https://github.com/jaysalvat/ezdz/archive/master.zip';
        stop();

        $input.ezdz('preview', fileUrl, function() {
            ok($preview.find('span').length, "has a file preview");

            equal($preview.find('span').text(), "master.zip");

            start();
        });
    });

    test('should destroy ezdz', function() {
        $input.ezdz('destroy');

        ok(!$input.parent('.ezdz-dropzone').length, "ezdz container is destroyed");
    });

    test('destroy should remove ezdz data', function() {
        $input = $('[type="file"]');
        $input.ezdz();
        $input.ezdz('destroy');
        ok(typeof $input.data('ezdz') === 'undefined', "ezdz data is removed");
    });
