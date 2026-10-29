/**
 * assets/js/main.js
 * Coordinador principal de eventos, navegación y ciclos de vida de Momentos Cookie.
 */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

function initApp() {
  const storage = window.StorageService || (window.StorageModule && window.StorageModule.createStorageService());
  if (!storage) {
    console.error('No se pudo inicializar StorageService.');
    return;
  }

  // 1. Navegación por pestañas (SPA)
  setupNavigation();

  // 2. Controladores de interacción del formulario
  setupFormHandlers(storage);

  // 3. Controladores de eventos de la Vista de Planificación
  setupPlanningHandlers(storage);

  // 4. Controladores de Búsqueda y Filtros en Vista de Todos los Pedidos
  setupSearchAndFilterHandlers(storage);

  // 5. Delegación de clics en tarjetas de pedido (acciones rápidas, editar, borrar, ver detalle)
  setupCardActionDelegation(storage);

  // 6. Botón de restauración de datos de muestra
  setupResetSeedHandler(storage);

  // 7. Controladores de la Vista de Producción y Respaldo
  setupProductionHandlers(storage);

  // 8. Controladores de Comprobantes y Configuración del Taller (Spec 003)
  setupReceiptAndSettingsHandlers(storage);

  // 9. Aplicar configuración de marca inicial y estado inicial del formulario
  if (window.UI) {
    if (window.UI.updateBusinessBranding) {
      window.UI.updateBusinessBranding(storage.getSettings());
    }
    if (window.UI.resetForm) {
      window.UI.resetForm();
    }
  }

  // 10. Renderizado inicial de vistas
  refreshAllViews(storage);
}

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.getAttribute('data-view');
      if (viewId && window.UI) {
        if (viewId === 'view-form') {
          const modeInput = document.getElementById('order-mode');
          if (modeInput && modeInput.value === 'edit') {
            window.UI.resetForm();
          }
        }
        window.UI.switchView(viewId);
      }
    });
  });
}

function setupPlanningHandlers(storage) {
  const filterSelect = document.getElementById('planning-status-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      if (window.UI && window.UI.renderPlanningView) {
        window.UI.renderPlanningView(storage.getOrders());
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      }
    });
  }
}

function setupSearchAndFilterHandlers(storage) {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const filterChips = document.querySelectorAll('#orders-status-filters .filter-chip');

  const triggerSearch = () => {
    const text = searchInput ? searchInput.value.trim() : '';
    if (clearBtn) {
      if (text) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    const activeChip = document.querySelector('#orders-status-filters .filter-chip.bg-cookie-500');
    const status = activeChip ? activeChip.getAttribute('data-status') : 'todos';

    if (window.UI && window.UI.renderAllOrdersView) {
      window.UI.renderAllOrdersView(storage.getOrders(), { searchText: text, filterStatus: status });
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', triggerSearch);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      triggerSearch();
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => {
        c.className = 'filter-chip px-3 py-1.5 rounded-lg bg-[#F0EAE1] text-[#5A4A42] hover:bg-[#E5DDD2] transition-colors';
      });
      chip.className = 'filter-chip px-3 py-1.5 rounded-lg bg-cookie-500 text-white font-semibold transition-colors';
      triggerSearch();
    });
  });
}

function setupResetSeedHandler(storage) {
  const btnReset = document.getElementById('btn-reset-seed');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Restaurar los pedidos de demostración iniciales? Se reemplazarán los pedidos actuales por el set inicial de pruebas.')) {
        storage.resetToSeedData();
        if (window.UI) {
          window.UI.showToast('Datos de demostración restaurados.', 'info');
        }
        refreshAllViews(storage);
      }
    });
  }
}

function setupCardActionDelegation(storage) {
  document.addEventListener('click', (e) => {
    // 1. Ver detalle al hacer clic en el encabezado de la tarjeta
    const viewDetailEl = e.target.closest('[data-action="view-detail"]');
    if (viewDetailEl) {
      const orderId = viewDetailEl.getAttribute('data-id');
      const order = storage.getOrderById(orderId);
      if (order && window.UI) {
        window.UI.openDetailModal(order);
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      }
      return;
    }

    // 2. Imprimir ticket / comprobante desde tarjeta
    const ticketBtn = e.target.closest('[data-action="print-ticket"]');
    if (ticketBtn) {
      const orderId = ticketBtn.getAttribute('data-id');
      const order = storage.getOrderById(orderId);
      if (order && window.UI && window.UI.openReceiptModal) {
        window.UI.openReceiptModal(order, storage.getSettings());
      }
      return;
    }

    // 3. Acción rápida de estado (siguiente paso)
    const quickBtn = e.target.closest('[data-action="quick-status"]');
    if (quickBtn) {
      const orderId = quickBtn.getAttribute('data-id');
      const nextStatus = quickBtn.getAttribute('data-next');
      if (orderId && nextStatus) {
        storage.updateOrderStatus(orderId, nextStatus);
        if (window.UI) {
          window.UI.showToast(`Pedido ${orderId} actualizado a "${nextStatus}"`, 'success');
        }
        refreshAllViews(storage);
      }
      return;
    }

    // 4. Editar pedido
    const editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) {
      const orderId = editBtn.getAttribute('data-id');
      const order = storage.getOrderById(orderId);
      if (order && window.UI) {
        window.UI.populateForm(order);
      }
      return;
    }

    // 5. Eliminar pedido con diálogo nativo
    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const orderId = deleteBtn.getAttribute('data-id');
      const modalDelete = document.getElementById('modal-delete');
      const deleteInfo = document.getElementById('delete-order-info');
      const confirmBtn = document.getElementById('btn-confirm-delete');
      const cancelBtn = document.getElementById('btn-cancel-delete');

      if (modalDelete && deleteInfo) {
        deleteInfo.textContent = `¿Confirmas que deseas eliminar el pedido ${orderId}? Esta acción no se puede deshacer.`;
        modalDelete.showModal();

        const onConfirm = () => {
          storage.deleteOrder(orderId);
          modalDelete.close();
          if (window.UI) {
            window.UI.showToast(`Pedido ${orderId} eliminado.`, 'info');
          }
          refreshAllViews(storage);
          cleanup();
        };

        const onCancel = () => {
          modalDelete.close();
          cleanup();
        };

        const cleanup = () => {
          confirmBtn.removeEventListener('click', onConfirm);
          cancelBtn.removeEventListener('click', onCancel);
        };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
      }
    }
  });
}

function setupFormHandlers(storage) {
  const form = document.getElementById('order-form');
  const btnInd = document.getElementById('btn-mode-individual');
  const btnCombo = document.getElementById('btn-mode-combo');
  const paymentSelect = document.getElementById('payment-status');
  const btnCancel = document.getElementById('btn-cancel-form');

  if (btnInd) {
    btnInd.addEventListener('click', () => {
      if (window.UI) window.UI.setOrderType('individual');
    });
  }

  if (btnCombo) {
    btnCombo.addEventListener('click', () => {
      if (window.UI) window.UI.setOrderType('combo');
    });
  }

  if (paymentSelect) {
    paymentSelect.addEventListener('change', () => {
      if (window.UI) {
        window.UI.toggleDepositContainer();
        window.UI.updateLiveSummary();
      }
    });
  }

  const inputsCalculo = [
    'individual-quantity',
    'individual-price',
    'combo-quantity',
    'combo-price',
    'deposit-amount'
  ];

  inputsCalculo.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (window.UI) window.UI.updateLiveSummary();
      });
    }
  });

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (window.UI) {
        window.UI.resetForm();
        window.UI.switchView('view-planning');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerName = document.getElementById('customer-name')?.value;
      const phone = document.getElementById('customer-phone')?.value;
      const deliveryDate = document.getElementById('delivery-date')?.value;

      const validacion = window.UI ? window.UI.validateOrderInput({ customerName, phone, deliveryDate }) : { valid: true };
      if (!validacion.valid) {
        if (window.UI) window.UI.showToast(validacion.error, 'error');
        return;
      }

      const isCombo = document.querySelector('input[name="orderType"][value="combo"]')?.checked;
      const inputs = {
        orderId: document.getElementById('order-id')?.value || '',
        createdAt: new Date().toISOString(),
        customerName,
        customerPhone: phone,
        customerEmail: document.getElementById('customer-email')?.value,
        deliveryDate,
        deliveryTime: document.getElementById('delivery-time')?.value,
        orderType: isCombo ? 'combo' : 'individual',
        individualFlavor: document.getElementById('individual-flavor')?.value,
        individualQuantity: document.getElementById('individual-quantity')?.value,
        individualPrice: document.getElementById('individual-price')?.value,
        comboName: document.getElementById('combo-name')?.value,
        comboCookiesCount: document.getElementById('combo-cookies-count')?.value,
        comboPackaging: document.getElementById('combo-packaging')?.value,
        comboHasPaintKit: document.getElementById('combo-has-paint-kit')?.checked,
        comboQuantity: document.getElementById('combo-quantity')?.value,
        comboPrice: document.getElementById('combo-price')?.value,
        notes: document.getElementById('order-notes')?.value,
        orderStatus: document.getElementById('order-status')?.value,
        paymentStatus: document.getElementById('payment-status')?.value,
        depositAmount: document.getElementById('deposit-amount')?.value
      };

      const pedido = window.UI ? window.UI.extractOrderFromInputs(inputs) : null;
      if (pedido) {
        storage.saveOrder(pedido);
        if (window.UI) {
          window.UI.showToast(`¡Pedido ${pedido.id} guardado con éxito!`, 'success');
          window.UI.resetForm();
          window.UI.switchView('view-planning');
        }
        refreshAllViews(storage);
      }
    });
  }
}

function setupProductionHandlers(storage) {
  const rangeFilter = document.getElementById('production-range-filter');
  const printBtn = document.getElementById('btn-print-production');
  const exportJsonBtn = document.getElementById('btn-export-json');
  const exportCsvBtn = document.getElementById('btn-export-csv');
  const importJsonBtn = document.getElementById('btn-import-json');
  const fileInput = document.getElementById('import-file-input');

  if (rangeFilter) {
    rangeFilter.addEventListener('change', () => {
      if (window.UI && window.UI.renderProductionView) {
        window.UI.renderProductionView(storage.getOrders());
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const jsonStr = storage.exportBackupJson();
      const fecha = new Date().toISOString().slice(0, 10);
      if (window.UI) {
        window.UI.downloadFile(jsonStr, `momentos-cookie-backup-${fecha}.json`, 'application/json');
        window.UI.showToast('Copia de seguridad descargada.', 'success');
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const csvStr = storage.exportOrdersCsv();
      const fecha = new Date().toISOString().slice(0, 10);
      if (window.UI) {
        window.UI.downloadFile(csvStr, `momentos-cookie-pedidos-${fecha}.csv`, 'text/csv;charset=utf-8');
        window.UI.showToast('Archivo CSV exportado exitosamente.', 'success');
      }
    });
  }

  if (importJsonBtn && fileInput) {
    importJsonBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const res = storage.importBackupJson(content, { mode: 'merge' });

        if (res.success) {
          if (window.UI) {
            window.UI.showToast(`Respaldo importado: ${res.count} pedidos sincronizados.`, 'success');
          }
          refreshAllViews(storage);
        } else {
          if (window.UI) {
            window.UI.showToast(`Error de importación: ${res.error}`, 'error');
          }
        }
        fileInput.value = '';
      };

      reader.onerror = () => {
        if (window.UI) window.UI.showToast('Error al leer el archivo seleccionado.', 'error');
        fileInput.value = '';
      };

      reader.readAsText(file);
    });
  }
}

function setupReceiptAndSettingsHandlers(storage) {
  const modalReceipt = document.getElementById('modal-receipt');
  const btnCloseReceipt = document.getElementById('btn-close-receipt');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  const btnTicketFromDetail = document.getElementById('btn-ticket-from-detail');

  if (btnCloseReceipt && modalReceipt) {
    btnCloseReceipt.addEventListener('click', () => {
      modalReceipt.close();
    });
  }

  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', () => {
      document.body.classList.add('printing-receipt');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-receipt');
      }, 500);
    });

    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing-receipt');
    });
  }

  if (btnTicketFromDetail) {
    btnTicketFromDetail.addEventListener('click', () => {
      const orderId = document.getElementById('detail-order-id')?.textContent.trim();
      if (orderId) {
        const order = storage.getOrderById(orderId);
        if (order && window.UI && window.UI.openReceiptModal) {
          window.UI.openReceiptModal(order, storage.getSettings());
        }
      }
    });
  }

  const modalSettings = document.getElementById('modal-settings');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const formSettings = document.getElementById('settings-form');

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      if (window.UI && window.UI.openSettingsModal) {
        window.UI.openSettingsModal(storage.getSettings());
      }
    });
  }

  if (modalSettings) {
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => modalSettings.close());
    if (btnCancelSettings) btnCancelSettings.addEventListener('click', () => modalSettings.close());
  }

  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();

      const newSettings = {
        businessName: document.getElementById('setting-business-name')?.value.trim() || 'Momentos Cookie',
        phone: document.getElementById('setting-phone')?.value.trim() || '',
        currencySymbol: document.getElementById('setting-currency-symbol')?.value.trim() || '$',
        footerMessage: document.getElementById('setting-footer-message')?.value.trim() || ''
      };

      storage.saveSettings(newSettings);

      if (window.UI) {
        if (window.UI.updateBusinessBranding) {
          window.UI.updateBusinessBranding(newSettings);
        }
        if (window.UI.showToast) {
          window.UI.showToast('Configuración del taller guardada.', 'success');
        }
      }

      if (modalSettings) modalSettings.close();
      refreshAllViews(storage);
    });
  }
}

function refreshAllViews(storage) {
  const orders = storage.getOrders();

  const counterEl = document.getElementById('active-orders-counter');
  if (counterEl) {
    const activas = orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado');
    counterEl.textContent = `${activas.length} pedido${activas.length === 1 ? '' : 's'} activo${activas.length === 1 ? '' : 's'}`;
  }

  if (window.UI && window.UI.renderPlanningView) {
    window.UI.renderPlanningView(orders);
  }
  if (window.UI && window.UI.renderAllOrdersView) {
    window.UI.renderAllOrdersView(orders);
  }
  if (window.UI && window.UI.renderProductionView) {
    window.UI.renderProductionView(orders);
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initApp, refreshAllViews };
}
