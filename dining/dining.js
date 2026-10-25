/* Yunic Dining section: tap-to-flip cards and WhatsApp enquiry form */
(function () {
  'use strict';
  document.querySelectorAll('.flip').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    });
  });

  var form = document.getElementById('requestForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = [['f-name', 'Name'], ['f-contact', 'Contact'], ['f-date', 'Date'], ['f-loc', 'Location'], ['f-guests', 'Guests'], ['f-msg', 'Occasion']];
      var lines = ['Hello Yunic, I would like to discuss a Yunic Dining experience.', ''];
      fields.forEach(function (f) {
        var v = document.getElementById(f[0]).value.trim();
        if (v) lines.push(f[1] + ': ' + v);
      });
      window.open('https://wa.me/6281994807407?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();
