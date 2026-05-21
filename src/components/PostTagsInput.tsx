import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
  normalizePostTag,
  postTagKey,
  searchPostTags,
} from '../utils/postTagUtils';
import { loadPostTags } from '../utils/postTags';
import './PostTagsInput.css';

interface PostTagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  id?: string;
}

export const PostTagsInput: React.FC<PostTagsInputProps> = ({ value, onChange, id = 'post-tags' }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const refreshAvailableTags = useCallback(async () => {
    const tags = await loadPostTags();
    setAvailableTags(tags);
  }, []);

  useEffect(() => {
    void refreshAvailableTags();
  }, [refreshAvailableTags]);

  const selectedKeys = useMemo(() => new Set(value.map((tag) => postTagKey(tag))), [value]);
  const suggestions = useMemo(
    () => searchPostTags(inputValue, value, availableTags),
    [inputValue, value, availableTags]
  );

  const trimmedInput = normalizePostTag(inputValue);
  const canCreate =
    trimmedInput.length > 0 &&
    !selectedKeys.has(postTagKey(trimmedInput)) &&
    !availableTags.some((tag) => postTagKey(tag) === postTagKey(trimmedInput));

  const optionCount = suggestions.length + (canCreate ? 1 : 0);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue, suggestions.length, canCreate]);

  const addTag = (tag: string) => {
    const normalized = normalizePostTag(tag);
    if (!normalized || selectedKeys.has(postTagKey(normalized))) {
      return;
    }

    onChange([...value, normalized]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => postTagKey(tag) !== postTagKey(tagToRemove)));
  };

  const handleSelectOption = (index: number) => {
    if (canCreate && index === 0) {
      addTag(trimmedInput);
      return;
    }

    const suggestionIndex = canCreate ? index - 1 : index;
    const tag = suggestions[suggestionIndex];
    if (tag) {
      addTag(tag);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
      return;
    }

    if (event.key === 'ArrowDown' && isOpen && optionCount > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % optionCount);
      return;
    }

    if (event.key === 'ArrowUp' && isOpen && optionCount > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + optionCount) % optionCount);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if ((event.key === 'Enter' || event.key === ',') && (trimmedInput || optionCount > 0)) {
      event.preventDefault();

      if (isOpen && optionCount > 0) {
        handleSelectOption(activeIndex);
        return;
      }

      if (trimmedInput) {
        addTag(trimmedInput);
      }
    }
  };

  const showDropdown = isOpen && (optionCount > 0 || (!trimmedInput && value.length === 0));

  return (
    <div ref={containerRef} className="post-tags-input">
      <div
        className="post-tags-input-field"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {value.map((tag) => (
          <span key={postTagKey(tag)} className="post-tags-chip" data-testid={`tag-chip-${postTagKey(tag)}`}>
            {tag}
            <button
              type="button"
              className="post-tags-chip-remove"
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag);
              }}
              aria-label={t('editor.tagsRemove', { tag })}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            void refreshAvailableTags();
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={value.length === 0 ? t('editor.tagsPlaceholder') : t('editor.tagsAddMore')}
          className="post-tags-text-input"
          data-testid="input-post-tags"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
        />
      </div>

      {showDropdown && (
        <ul id={`${id}-listbox`} className="post-tags-dropdown" role="listbox">
          {canCreate && (
            <li
              role="option"
              aria-selected={activeIndex === 0}
              className={`post-tags-option post-tags-option-create ${activeIndex === 0 ? 'is-active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(trimmedInput)}
              data-testid="tag-create-option"
            >
              {t('editor.tagsCreate', { tag: trimmedInput })}
            </li>
          )}

          {suggestions.map((tag, index) => {
            const optionIndex = canCreate ? index + 1 : index;

            return (
              <li
                key={postTagKey(tag)}
                role="option"
                aria-selected={activeIndex === optionIndex}
                className={`post-tags-option ${activeIndex === optionIndex ? 'is-active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(tag)}
                data-testid={`tag-suggestion-${postTagKey(tag)}`}
              >
                {tag}
              </li>
            );
          })}

          {!canCreate && suggestions.length === 0 && (
            <li className="post-tags-option post-tags-option-empty">{t('editor.tagsEmpty')}</li>
          )}
        </ul>
      )}
    </div>
  );
};
