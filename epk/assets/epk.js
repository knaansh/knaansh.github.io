// Copy buttons: Clipboard API first, then a hidden-textarea fallback for older or insecure contexts.
(function(){
  function fallback(text){
    var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');
    t.style.position='fixed';t.style.top='-1000px';document.body.appendChild(t);t.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}
    document.body.removeChild(t);return ok?Promise.resolve():Promise.reject();
  }
  function copy(text){
    if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(text).catch(function(){return fallback(text)})}
    return fallback(text);
  }
  document.querySelectorAll('[data-copy]').forEach(function(btn){
    var label=btn.textContent, status=document.getElementById('copy-status');
    btn.addEventListener('click',function(){
      var el=document.querySelector('[data-slot="'+btn.getAttribute('data-copy')+'"]');
      var text=Array.prototype.map.call(el.querySelectorAll('p'),function(p){return p.innerText.trim()}).join('\n\n');
      copy(text).then(function(){
        btn.textContent='Copied';btn.classList.add('done');if(status)status.textContent=btn.getAttribute('aria-label')+': copied';
      },function(){
        btn.textContent='Select text';if(status)status.textContent='Copy failed. Select the text instead.';
        var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);
      }).then(function(){setTimeout(function(){btn.textContent=label;btn.classList.remove('done')},2000)});
    });
  });
})();
