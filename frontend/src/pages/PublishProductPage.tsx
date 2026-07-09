import {
  type ChangeEvent,
  type DragEvent,
  type SubmitEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useNavigate } from 'react-router-dom'
import {
  productService,
  validateProductImage,
} from '../api/productService'
import AppNavbar from '../components/layout/AppNavbar'
import ChevronDownIcon from '../components/icons/ChevronDownIcon'
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

type FieldErrors = {
  image?: string
  name?: string
  price?: string
}

function getFieldErrors(
  imageFile: File | null,
  name: string,
  price: string,
  isDonation: boolean,
): FieldErrors {
  const errors: FieldErrors = {}

  if (!imageFile) {
    errors.image = 'Debes subir una foto del producto.'
  }

  if (!name.trim()) {
    errors.name = 'Ingresa el nombre del producto.'
  }

  if (!isDonation) {
    const parsedPrice = Number(price)
    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      errors.price = 'Ingresa un precio válido.'
    }
  }

  return errors
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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
      setFieldErrors((prev) => ({ ...prev, image: validationError }))
      return
    }

    setFieldErrors((prev) => ({ ...prev, image: undefined }))
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const nextFieldErrors = getFieldErrors(imageFile, name, price, isDonation)
    if (Object.keys(nextFieldErrors).length > 0 || !imageFile) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})

    const parsedPrice = isDonation ? 0 : Number(price)

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

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(paths.gallery, { replace: true })
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
        <button type="button" className="publish-page__back" onClick={handleBack}>
          ← Volver
        </button>

        <h1 className="publish-page__title">Publicar producto</h1>

        <div className="publish-page__layout">
          <form className="publish-form" onSubmit={handleSubmit} noValidate>
            <section className="publish-form__section">
              <h2 className="publish-form__section-title">Foto del producto</h2>

              <input
                id="product-image"
                ref={fileInputRef}
                type="file"
                className="publish-form__file-input"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
              />

              <label
                htmlFor="product-image"
                className={`publish-form__dropzone${
                  isDragging ? ' publish-form__dropzone--dragging' : ''
                }${imagePreview ? ' publish-form__dropzone--has-image' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
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
              </label>

              {fieldErrors.image && (
                <p className="publish-form__field-error" role="alert">
                  {fieldErrors.image}
                </p>
              )}

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
                  className={`publish-form__input${
                    fieldErrors.name ? ' publish-form__input--error' : ''
                  }`}
                  type="text"
                  placeholder="Ej. Arduino Uno R3"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'product-name-error' : undefined}
                />
                {fieldErrors.name && (
                  <p
                    id="product-name-error"
                    className="publish-form__field-error"
                    role="alert"
                  >
                    {fieldErrors.name}
                  </p>
                )}
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
                <span id="product-category-label" className="publish-form__label">
                  Categoría
                </span>
                <DropdownMenu.Root modal={false}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      id="product-category"
                      className="publish-form__category-trigger"
                      aria-labelledby="product-category-label product-category"
                    >
                      <span id="product-category">{category}</span>
                      <ChevronDownIcon className="publish-form__category-chevron" />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="publish-form__category-menu"
                      align="start"
                      sideOffset={8}
                      collisionPadding={16}
                    >
                      {publishCategories.map((item) => (
                        <DropdownMenu.Item
                          key={item}
                          className={`publish-form__category-option${
                            category === item
                              ? ' publish-form__category-option--active'
                              : ''
                          }`}
                          onSelect={() => setCategory(item)}
                        >
                          {item}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              <div className="publish-form__field">
                <label htmlFor="product-price" className="publish-form__label">
                  Precio (COP)
                </label>
                <input
                  id="product-price"
                  className={`publish-form__input${
                    fieldErrors.price ? ' publish-form__input--error' : ''
                  }`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder={isDonation ? '0' : 'Ej. 75000'}
                  value={isDonation ? '0' : price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                    if (fieldErrors.price) {
                      setFieldErrors((prev) => ({ ...prev, price: undefined }))
                    }
                  }}
                  disabled={isDonation}
                  aria-invalid={Boolean(fieldErrors.price)}
                  aria-describedby={fieldErrors.price ? 'product-price-error' : undefined}
                />
                {fieldErrors.price && (
                  <p
                    id="product-price-error"
                    className="publish-form__field-error"
                    role="alert"
                  >
                    {fieldErrors.price}
                  </p>
                )}
              </div>
            </div>

            <section className="publish-form__section">
              <fieldset className="publish-form__chips-fieldset">
                <legend className="publish-form__section-title">Estado del producto</legend>

                <div className="publish-form__chips">
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
              </fieldset>
            </section>

            <section className="publish-form__section">
              <div className="publish-form__donation-card">
                <div className="publish-form__donation-copy">
                  <p id="donation-toggle-label" className="publish-form__donation-title">
                    Quiero donarlo gratis
                  </p>
                  <p className="publish-form__donation-hint">
                    El precio se pondrá en $0 automáticamente
                  </p>
                </div>

                <label
                  className="publish-form__toggle"
                  aria-labelledby="donation-toggle-label"
                >
                  <input
                    type="checkbox"
                    checked={isDonation}
                    onChange={(e) => {
                      setIsDonation(e.target.checked)
                      if (e.target.checked) {
                        setFieldErrors((prev) => ({ ...prev, price: undefined }))
                      }
                    }}
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
