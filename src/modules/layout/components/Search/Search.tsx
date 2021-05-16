import { ClickAwayListener, IconButton, InputBase } from '@material-ui/core';
import { useDispatchRequest } from '@redux-requests/react';
import classNames from 'classnames';
import { SearchIcon } from 'modules/common/components/Icons/SearchIcon';
import { Queries } from 'modules/common/components/Queries/Queries';
import { ResponseData } from '../../../common/types/ResponseData';
import React, { useEffect, useRef, useState } from 'react';
import { getByLikStr } from './getByLikeStr';
import { SearchResult } from './SearchResult';
import { useSearchStyles } from './SearchStyles';

const ANIMATION_TIMEOUT = 200;

interface ISearchProps {
  className?: string;
  focus?: boolean;
}

export const Search = ({ className, focus }: ISearchProps) => {
  const classes = useSearchStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatchRequest();
  const [showResult, setShowResult] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (focus) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, ANIMATION_TIMEOUT);
    }
  }, [focus]);

  const handleSearch = () => {
    dispatch(getByLikStr(value))
    setShowResult(true)
  }

  const handleKeyup = (event: any) => {
    const value = event.target.value;
    setValue(value);
    if (event.keyCode === 13) {
      handleSearch();
    }

  }

  const handleClickAway = () => {
    setShowResult(false)
  }

  return (<div className={classes.root}>
    <div className={classNames(classes.root, className)}>
      <InputBase
        required
        inputRef={inputRef}
        className={classes.input}
        classes={{
          focused: classes.inputFocused,
          input: classes.inputBase,
        }}
        onKeyUp={handleKeyup}
        placeholder="Search by name, creator, brand..."
        startAdornment={
          <IconButton
            onClick={handleSearch}
            className={classes.iconButton}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        }
      />
    </div>
    {showResult && <ClickAwayListener onClickAway={handleClickAway}>
      <div className={classes.searchResult}>
        <Queries<ResponseData<typeof getByLikStr>>
          requestActions={[getByLikStr]}
        >
          {({ loading, error, data }) => (
            <SearchResult
              loading={loading}
              error={error}
              data={data}
            />
          )}
        </Queries>
      </div>
    </ClickAwayListener>}
  </div>
  );
};
