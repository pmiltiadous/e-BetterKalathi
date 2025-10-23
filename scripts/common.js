function showToast (type = 'info', message = '', duration = 2000) {
  Swal.fire({
    toast: true,
    position: 'top',
    icon: type,
    title: message,
    showConfirmButton: false,
    showCloseButton: true,
    timer: duration,
    timerProgressBar: true,
    background: '#fff',
    color: '#333',
    iconColor:
      type === 'warning'
        ? '#fbbf24'
        : type === 'success'
        ? '#34d399'
        : type === 'error'
        ? '#f87171'
        : type === 'info'
        ? '#60a5fa'
        : '#ccc',
    width: '320px',
    padding: '0.75rem 1rem',
    customClass: {
      popup: 'shadow-lg rounded-md'
    }
  })
}
