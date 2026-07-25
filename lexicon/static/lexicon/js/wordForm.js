document.addEventListener('DOMContentLoaded', function () {
  if (window.jQuery && document.getElementById('id_parents')) {
    $('#id_parents').select2({
      placeholder: "Rechercher un mot...",
      width: '100%',
      allowClear: true
    });
  }
});