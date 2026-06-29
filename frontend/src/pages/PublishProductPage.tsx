import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  productService,
  validateProductImage,
} from '../api/productService'
import AppNavbar from '../components/layout/AppNavbar'
import ImagePlaceholderIcon from '../components/icons/ImagePlaceholderIcon'
import UploadIcon from '../components/icons/UploadIcon'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import type { ProductCondition } from '../types/api'
import {
  fromApiCategoryToPublish,
  publishCategories,
  toApiCategoryFromPublish,
  type PublishCategory,
} from '../utils/categories'
import { formatPrice } from '../utils/formatPrice'
import { conditionChips, getConditionLabel } from '../utils/productLabels'
import './PublishProductPage.css'

export default function PublishProductPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PublishCategory>('Microcontroladores')
  const [condition, setCondition] = useState<ProductCondition>('new')
  const [price, setPrice] = useState('')
  const [isDonation, setIsDonation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  function setImage(file: File | null) {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    const validationError = validateProductImage(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    setImage(file)
  }

  async function handleGenerateDescription() {
    if (!imageFile || isGeneratingDescription || isSubmitting) {
      return
    }

    const hasExistingData = name.trim() || description.trim()
    if (hasExistingData && !window.confirm('¿Reemplazar los datos actuales con sugerencias de IA?')) {
      return
    }

    setError(null)
    setIsGeneratingDescription(true)

    try {
      const result = await productService.generateDescription(imageFile)
      setName(result.name)
      setDescription(result.description)
      setCategory(fromApiCategoryToPublish(result.category))
      setCondition(result.condition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar la descripción')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!imageFile) {
      setError('Debes subir una foto del producto.')
      return
    }

    const parsedPrice = isDonation ? 0 : Number(price)
    if (!isDonation && (!price || Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setError('Ingresa un precio válido.')
      return
    }

    setIsSubmitting(true)

    try {
      await productService.publishProduct(imageFile, {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        is_donation: isDonation,
        category: toApiCategoryFromPublish(category),
        condition,
      })
      navigate(paths.gallery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewName = name.trim() || 'Nombre del producto'
  const previewDescription = description.trim()
  const previewPrice = isDonation ? 0 : Number(price) || 0
  const previewPriceLabel = formatPrice(previewPrice, isDonation)

  if (isAuthLoading) {
    return (
      <div className="publish-page">
        <AppNavbar />
        <p className="publish-page__loading">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="publish-page">
      <AppNavbar />

      <main className="publish-page__main">
        <Link to={paths.gallery} className="publish-page__back">
          ← Volver
        </Link>

        <h1 className="publish-page__title">Publicar producto</h1>

        <div className="publish-page__layout">
          <form className="publish-form" onSubmit={handleSubmit}>
            <section className="publish-form__section">
              <h2 className="publish-form__section-title">Foto del producto</h2>

              <div
                className={`publish-form__dropzone${
                  isDragging ? ' publish-form__dropzone--dragging' : ''
                }${imagePreview ? ' publish-form__dropzone--has-image' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Subir foto del producto"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="publish-form__file-input"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa de la foto"
                    className="publish-form__dropzone-preview"
                  />
                ) : (
                  <div className="publish-form__dropzone-content">
                    <UploadIcon className="publish-form__dropzone-icon" />
                    <p className="publish-form__dropzone-text">
                      Arrastra tu foto aquí o haz clic
                    </p>
                    <p className="publish-form__dropzone-hint">
                      JPG, PNG, WEBP, GIF · Máx 5MB
                    </p>
                  </div>
                )}
              </div>

              <p className="publish-form__helper">
                Una buena foto aumenta las posibilidades de venta
              </p>

              {imagePreview && (
                <button
                  type="button"
                  className="publish-form__remove-image"
                  onClick={() => setImage(null)}
                >
                  Quitar foto
                </button>
              )}
            </section>

            <section className="publish-form__section">
              <h2 className="publish-form__section-title">Información básica</h2>

              <div className="publish-form__field">
                <label htmlFor="product-name" className="publish-form__label">
                  Nombre del producto
                </label>
                <input
                  id="product-name"
                  className="publish-form__input"
                  type="text"
                  placeholder="Ej. Arduino Uno R3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="publish-form__field">
                <div className="publish-form__label-row">
                  <label htmlFor="product-description" className="publish-form__label">
                    Descripción
                  </label>
                  <button
                    type="button"
                    className="publish-form__ai-button"
                    onClick={handleGenerateDescription}
                    disabled={!imageFile || isSubmitting || isGeneratingDescription}
                  >
                    {isGeneratingDescription ? 'Generando...' : 'Sugerir con IA'}
                  </button>
                </div>
                <textarea
                  id="product-description"
                  className="publish-form__textarea"
                  placeholder="Describe el estado, accesorios incluidos, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </section>

            <div className="publish-form__row">
              <div className="publish-form__field">
                <label htmlFor="product-category" className="publish-form__label">
                  Categoría
                </label>
                <select
                  id="product-category"
                  className="publish-form__select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PublishCategory)}
                  required
                >
                  {publishCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="publish-form__field">
                <label htmlFor="product-price" className="publish-form__label">
                  Precio (COP)
                </label>
                <input
                  id="product-price"
                  className="publish-form__input"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder={isDonation ? '0' : 'Ej. 75000'}
                  value={isDonation ? '0' : price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isDonation}
                  required={!isDonation}
                />
              </div>
            </div>

            <section className="publish-form__section">
              <h2 className="publish-form__section-title">Estado del producto</h2>

              <div
                className="publish-form__chips"
                role="group"
                aria-label="Estado del producto"
              >
                {conditionChips.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`publish-form__chip${
                      condition === item.value ? ' publish-form__chip--active' : ''
                    }`}
                    onClick={() => setCondition(item.value)}
                    aria-pressed={condition === item.value}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="publish-form__section">
              <div className="publish-form__donation-card">
                <div className="publish-form__donation-copy">
                  <p className="publish-form__donation-title">
                    Quiero donarlo gratis
                  </p>
                  <p className="publish-form__donation-hint">
                    El precio se pondrá en $0 automáticamente
                  </p>
                </div>

                <label className="publish-form__toggle">
                  <input
                    type="checkbox"
                    checked={isDonation}
                    onChange={(e) => setIsDonation(e.target.checked)}
                  />
                  <span className="publish-form__toggle-track" aria-hidden="true">
                    <span className="publish-form__toggle-thumb" />
                  </span>
                </label>
              </div>
            </section>

            {error && (
              <p className="publish-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="publish-form__actions">
              <button
                type="submit"
                className="publish-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
              <Link to={paths.gallery} className="publish-form__cancel">
                Cancelar
              </Link>
            </div>
          </form>

          <aside className="publish-preview" aria-label="Vista previa del producto">
            <p className="publish-preview__label">Vista previa</p>

            <article className="publish-preview__card">
              <div className="publish-preview__image">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="publish-preview__img" />
                ) : (
                  <ImagePlaceholderIcon className="publish-preview__placeholder" />
                )}
              </div>

              <div className="publish-preview__body">
                <h3 className="publish-preview__name">{previewName}</h3>
                <p className="publish-preview__price">{previewPriceLabel}</p>
                {previewDescription ? (
                  <p className="publish-preview__description">{previewDescription}</p>
                ) : (
                  <p className="publish-preview__description publish-preview__description--empty">
                    La descripción aparecerá aquí.
                  </p>
                )}
                <span className="publish-preview__badge">
                  {getConditionLabel(condition)}
                </span>
              </div>
            </article>
          </aside>
        </div>
      </main>
    </div>
  )
}
