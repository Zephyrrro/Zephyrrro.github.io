function moveFullBgImgOut() {
  const target = $('.full-bg-img')[0];
  const container = $('#background')[0];
  const header = $('header')[0];
  const mask = $('.mask')[0];
  container.removeChild(target);
  header.appendChild(target);
  mask.removeAttribute('style')
}

$(document).ready(function () {
  moveFullBgImgOut()
})