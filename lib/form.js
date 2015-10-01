var validateField = function(target) {
    
  var $form = $(target).closest('form'),
      $group = $(target).closest('.input-group'),
      $addon = $group.find('.input-group-addon'),
      $icon = $addon.find('i'),
      state = false;

  if (!$group.data('validate') && $(target).prop('required')) {
    state = $(target).val() ? true : false;

  } else if ($group.data('validate') == "email") {
    state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($(target).val());

  } else if($group.data('validate') == 'phone') {
    state = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($(target).val());

  } else if ($group.data('validate') == "length") {
    state = $(target).val().length >= $group.data('length') ? true : false;

  } else if ($group.data('validate') == "number") {
    state = !isNaN(parseFloat($(target).val())) && isFinite($(target).val());    

  } else {
    state = true;
  }

  if (state) {
    $addon.removeClass('danger');
    $addon.addClass('success');
    $icon.attr('class', 'fa fa-check fa-lg');

  } else{
    $addon.removeClass('success');
    $addon.addClass('danger');
    $icon.attr('class', 'fa fa-warning fa-lg');
  }

  if ($form.find('.input-group-addon.danger').length === 0) {
    $form.find('[type="submit"]').prop('disabled', false);

  } else{
    $form.find('[type="submit"]').prop('disabled', true);
  }    

}

module.exports = {
  validateField: validateField
}