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

  // 9. Controladores de Respaldo y Recuperación en Menú Principal (Spec 004)
  setupHeaderBackupHandlers(storage);

  // Auto-recuperación: si solo existen los 4 pedidos demostrativos base, restaurar automáticamente los pedidos reales consolidados
  const currentOrders = storage.getOrders();
  const isOnlyDemo = currentOrders.length === 4 && currentOrders.every(o => o.id && o.id.startsWith('MC-20261028-00'));
  if (isOnlyDemo && storage.restorePreviousData) {
    storage.restorePreviousData();
  } else if (storage.consolidateCurrentOrders) {
    storage.consolidateCurrentOrders();
  }

  // 10. Aplicar configuración de marca inicial y estado inicial del formulario
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
  const btnRestorePrev = document.getElementById('btn-restore-previous');

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

  if (btnRestorePrev) {
    btnRestorePrev.addEventListener('click', () => {
      if (confirm('¿Restaurar los pedidos reales consolidados (Sandra Vergara, Isabel Aranda, Constanza Blest, etc.)?')) {
        if (storage.restorePreviousData) {
          storage.restorePreviousData();
        }
        if (window.UI) {
          window.UI.showToast('¡Pedidos recuperados y consolidados exitosamente!', 'success');
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
  const btnAddItem = document.getElementById('btn-add-item');
  const itemsContainer = document.getElementById('order-items-list');
  const paymentSelect = document.getElementById('payment-status');
  const depositInput = document.getElementById('deposit-amount');
  const btnCancel = document.getElementById('btn-cancel-form');

  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
      if (window.UI && window.UI.addItemToOrder) {
        window.UI.addItemToOrder();
      }
    });
  }

  if (itemsContainer) {
    itemsContainer.addEventListener('click', (e) => {
      const typeBtn = e.target.closest('[data-action="set-item-type"]');
      if (typeBtn) {
        const id = typeBtn.getAttribute('data-id');
        const type = typeBtn.getAttribute('data-type');
        if (window.UI && window.UI.setItemType) {
          window.UI.setItemType(id, type);
        }
        return;
      }

      const delBtn = e.target.closest('[data-action="delete-item"]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        if (window.UI && window.UI.removeItemFromOrder) {
          window.UI.removeItemFromOrder(id);
        }
        return;
      }
    });

    itemsContainer.addEventListener('input', () => {
      if (window.UI && window.UI.updateLiveSummary) {
        window.UI.updateLiveSummary();
      }
    });

    itemsContainer.addEventListener('change', () => {
      if (window.UI && window.UI.updateLiveSummary) {
        window.UI.updateLiveSummary();
      }
    });
  }

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

  if (depositInput) {
    depositInput.addEventListener('input', () => {
      if (window.UI) window.UI.updateLiveSummary();
    });
  }

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

      const items = (window.UI && window.UI.extractItemsFromForm) ? window.UI.extractItemsFromForm() : [];
      const inputs = {
        orderId: document.getElementById('order-id')?.value || '',
        createdAt: new Date().toISOString(),
        customerName,
        customerPhone: phone,
        customerEmail: document.getElementById('customer-email')?.value,
        deliveryDate,
        deliveryTime: document.getElementById('delivery-time')?.value,
        items,
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

function setupHeaderBackupHandlers(storage) {
  const btnBackup = document.getElementById('btn-header-backup');
  const btnRestore = document.getElementById('btn-header-restore');
  const modalRestore = document.getElementById('modal-restore');
  const btnCloseRestore = document.getElementById('btn-close-restore');
  const btnCancelRestore = document.getElementById('btn-cancel-restore');
  const btnBrowseFile = document.getElementById('btn-browse-file');
  const dropzone = document.getElementById('restore-dropzone');
  const fileInput = document.getElementById('restore-file-input');
  const btnConfirmRestore = document.getElementById('btn-confirm-restore');

  let loadedBackupContent = null;

  if (btnBackup) {
    btnBackup.addEventListener('click', () => {
      const jsonStr = storage.exportBackupJson();
      const fecha = new Date().toISOString().slice(0, 10);
      if (window.UI && window.UI.downloadFile) {
        window.UI.downloadFile(jsonStr, `momentos-cookie-backup-${fecha}.json`, 'application/json');
        if (window.UI.showToast) {
          window.UI.showToast('Copia de seguridad descargada en tu equipo.', 'success');
        }
      }
    });
  }

  if (btnRestore) {
    btnRestore.addEventListener('click', () => {
      loadedBackupContent = null;
      if (window.UI && window.UI.openRestoreModal) {
        window.UI.openRestoreModal();
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      }
    });
  }

  if (modalRestore) {
    if (btnCloseRestore) btnCloseRestore.addEventListener('click', () => modalRestore.close());
    if (btnCancelRestore) btnCancelRestore.addEventListener('click', () => modalRestore.close());
  }

  if (btnBrowseFile && fileInput) {
    btnBrowseFile.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const fileNameEl = document.getElementById('restore-file-name');
      if (fileNameEl) fileNameEl.textContent = file.name;

      const reader = new FileReader();
      reader.onload = (event) => {
        loadedBackupContent = event.target.result;
        const helper = (typeof Production !== 'undefined' ? Production : (typeof window !== 'undefined' && window.Production));
        const validacion = helper && helper.validarEstructuraBackup ? helper.validarEstructuraBackup(loadedBackupContent) : null;

        const previewContainer = document.getElementById('restore-preview-container');
        const errorBox = document.getElementById('restore-error-box');
        const errorText = document.getElementById('restore-error-text');
        const badgeCount = document.getElementById('restore-orders-count-badge');
        const metaEl = document.getElementById('restore-preview-meta');

        if (validacion && (validacion.valid || validacion.valido)) {
          if (errorBox) errorBox.classList.add('hidden');
          if (previewContainer) previewContainer.classList.remove('hidden');
          if (badgeCount) badgeCount.textContent = `${validacion.count} pedido${validacion.count === 1 ? '' : 's'}`;
          if (metaEl) {
            const fechaStr = validacion.exportDate ? `Fecha de respaldo: ${new Date(validacion.exportDate).toLocaleDateString()}` : 'Copia de seguridad válida';
            metaEl.textContent = `${fechaStr} · Versión ${validacion.version || '1.0'}`;
          }
          if (btnConfirmRestore) btnConfirmRestore.disabled = false;
        } else {
          if (previewContainer) previewContainer.classList.add('hidden');
          if (errorBox) {
            errorBox.classList.remove('hidden');
            if (errorText) errorText.textContent = validacion?.error || 'El archivo seleccionado no contiene una copia de seguridad válida.';
          }
          if (btnConfirmRestore) btnConfirmRestore.disabled = true;
        }
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      };

      reader.onerror = () => {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Error al leer el archivo en el equipo.', 'error');
        }
      };

      reader.readAsText(file);
    });
  }

  const btnRestoreBuiltin = document.getElementById('btn-restore-builtin');
  if (btnRestoreBuiltin) {
    btnRestoreBuiltin.addEventListener('click', () => {
      if (storage.restorePreviousData) {
        storage.restorePreviousData();
      }
      if (window.UI) {
        window.UI.showToast('¡17 pedidos recuperados con éxito!', 'success');
      }
      if (modalRestore) modalRestore.close();
      refreshAllViews(storage);
    });
  }

  if (btnConfirmRestore) {
    btnConfirmRestore.addEventListener('click', () => {
      if (!loadedBackupContent) return;

      const modeRadio = document.querySelector('input[name="restoreMode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'merge';

      const res = storage.importBackupJson(loadedBackupContent, { mode });

      if (res.success) {
        if (window.UI) {
          if (window.UI.showToast) {
            window.UI.showToast(`Recuperación exitosa: ${res.count} pedidos sincronizados.`, 'success');
          }
          if (window.UI.updateBusinessBranding) {
            window.UI.updateBusinessBranding(storage.getSettings());
          }
        }
        if (modalRestore) modalRestore.close();
        refreshAllViews(storage);
      } else {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast(`Error al restaurar: ${res.error}`, 'error');
        }
      }
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
