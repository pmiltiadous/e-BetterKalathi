function showToast (type = 'info', message = '', duration = 2000) {
  const neoBgColor = 
    type === 'success' ? '#a3e635' :
    type === 'warning' ? '#fde047' : 
    type === 'error'   ? '#fb923c' : 
    type === 'info'    ? '#f472b6' : 
    '#ffffff';

  Swal.fire({
    toast: true,
    position: 'top-end', 
    icon: type,
    title: message,
    showConfirmButton: false,
    showCloseButton: true,
    timer: duration,
    timerProgressBar: true,
    background: neoBgColor,
    color: '#000000',
    iconColor: '#000000',
    width: 'auto',
    padding: '1rem 1.5rem',
    customClass: {
      popup: 'neo-toast-popup',
      timerProgressBar: 'neo-toast-progress',
      closeButton: 'neo-toast-close'
    }
  })
}