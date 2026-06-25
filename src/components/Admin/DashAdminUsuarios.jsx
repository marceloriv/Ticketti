import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, Spinner, Table } from 'react-bootstrap';
import { Trash2, Edit, RefreshCw } from 'lucide-react';
import { actualizarUsuario, eliminarUsuario, listarUsuarios } from '@api/usuariosApi';

const ROLES_USUARIO = [
  'CLIENTE',
  'ORGANIZADOR',
  'ADMIN',
  'ADMINPLATAFORMA',
];

const ROL_VARIANT = {
  CLIENTE: 'primary',
  ORGANIZADOR: 'success',
  ADMIN: 'warning',
  ADMINPLATAFORMA: 'danger',
};

export default function DashAdminUsuarios() {
  // Datos reales cargados desde MSUsuarios
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardandoId, setGuardandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError('');
    setExito('');

    try {
      const data = await listarUsuarios();

      const usuariosConNuevoRol = data.map((usuario) => ({
        ...usuario,
        nuevoRol: usuario.rol,
      }));

      setUsuarios(usuariosConNuevoRol);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'No se pudieron cargar los usuarios.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleCambiarRolSelect = (idUsuario, nuevoRol) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === idUsuario
          ? { ...usuario, nuevoRol }
          : usuario
      )
    );
  };
  //acá se hace la llamada a la API para actualizar el rol del usuario en el backend
  const handleGuardarRol = async (usuario) => {
    setGuardandoId(usuario.id);
    setError('');
    setExito('');

    try {
      const datosActualizados = {
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        rol: usuario.nuevoRol,
        aceptaTerminos: usuario.aceptaTerminos ?? false,
        aceptaPrivacidad: usuario.aceptaPrivacidad ?? false,
      };
      //llama a a la función actualizarUsuario del archivo usuariosApi.js para actualizar el rol del usuario en el backend
      await actualizarUsuario(usuario.id, datosActualizados);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuario.id
            ? {
              ...u,
              rol: usuario.nuevoRol,
              nuevoRol: usuario.nuevoRol,
            }
            : u
        )
      );

      setExito('Rol actualizado correctamente.');
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'No se pudo actualizar el rol del usuario.'
      );
    } finally {
      setGuardandoId(null);
    }
  };

  // Elimina un usuario desde el backend y luego lo quita de la tabla
  const handleEliminarUsuario = async (idUsuario) => {
    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.'
    );

    if (!confirmar) return;

    setEliminandoId(idUsuario);
    setError('');
    setExito('');

    try {
      // Llamada al backend: DELETE /usuarios/{id}
      await eliminarUsuario(idUsuario);

      // Si el backend responde bien, se elimina visualmente de la tabla
      setUsuarios((prev) =>
        prev.filter((usuario) => usuario.id !== idUsuario)
      );

      setExito('Usuario eliminado correctamente.');
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'No se pudo eliminar el usuario.'
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Gestión de usuarios</h5>

        <Button
          size="sm"
          variant="outline-primary"
          onClick={cargarUsuarios}
          disabled={cargando}
        >
          <RefreshCw size={14} /> Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {exito && (
        <Alert variant="success" dismissible onClose={() => setExito('')}>
          {exito}
        </Alert>
      )}

      {cargando ? (
        <div className="text-center py-4">
          <Spinner className="spinner-ticketti" />
        </div>
      ) : (
        <Table hover responsive size="sm">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Rol actual</th>
              <th>Cambiar rol</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="fw-semibold">{usuario.nombre}</td>

                <td className="text-muted small">{usuario.correo}</td>

                <td className="text-muted small">{usuario.telefono}</td>

                <td className="text-muted small">{usuario.direccion}</td>

                <td>
                  <Badge bg={ROL_VARIANT[usuario.rol] || 'secondary'}>
                    {usuario.rol}
                  </Badge>
                </td>

                <td style={{ minWidth: 180 }}>
                  <Form.Select
                    size="sm"
                    value={usuario.nuevoRol}
                    onChange={(e) =>
                      handleCambiarRolSelect(usuario.id, e.target.value)
                    }
                  >
                    {ROLES_USUARIO.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </Form.Select>
                </td>

                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    title="Guardar cambio de rol"
                    onClick={() => handleGuardarRol(usuario)}
                    disabled={
                      usuario.rol === usuario.nuevoRol ||
                      guardandoId === usuario.id
                    }
                  >
                    <Edit size={14} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline-danger"
                    title="Eliminar usuario"
                    onClick={() => handleEliminarUsuario(usuario.id)}
                    disabled={eliminandoId === usuario.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}






















































