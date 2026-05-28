#!/bin/bash

# Configurar git user
git config user.email "developer@cerebritos.com"
git config user.name "Cerebritos Developer"

# Agregar cambios
git add web-dashboard/src/services/firebase.ts
git add web-dashboard/src/pages/Dashboard.tsx
git add web-dashboard/src/App.css

# Hacer commit
git commit -m "feat(DQA-133): Agregar funcionalidad para eliminar cuenta de hijos

Implementación completa de la funcionalidad para gestionar y eliminar
cuentas de hijos desde el dashboard de padres.

Cambios realizados:

Backend (firebase.ts):
- Agregado método deleteChildAccount en UserService
- Implementa eliminación lógica (desactivación de cuenta)
- Elimina el vínculo padre-hijo de la colección vinculosPadreHijo
- Marca la cuenta del hijo como inactiva
- Manejo robusto de errores con mensajes descriptivos

Frontend (Dashboard.tsx):
- Nueva vista 'Gestionar Hijos' en el menú lateral
- Lista visual de todos los hijos vinculados con información detallada
- Botón de eliminación para cada hijo
- Modal de confirmación con advertencias claras
- Formulario inline para vincular nuevos hijos
- Estados de carga y mensajes de feedback

Estilos (App.css):
- Estilos para la sección de gestión de hijos
- Modal responsive con animaciones suaves
- Cards de hijos con hover effects
- Botones de acción con estados hover y disabled
- Responsive design para móviles

Criterios de aceptación cumplidos:
✅ Pantalla/sección para eliminar cuenta de hijo
✅ Confirmación antes de proceder con la eliminación
✅ Mensajes de éxito/error según resultado
✅ Cuenta eliminada no aparece en listado del padre

Ticket: DQA-133"

echo "Commit realizado exitosamente"
