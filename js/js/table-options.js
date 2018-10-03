(function ($) {
    var exist_rows = false;
    var click_outside = 0;

    let mandatory_fnc = {
        make_table: build_table,

    };

    $.fn.tableOptionable = function (menu_options) {

        let settings = $.extend({
            options: menu_options,
            mandatory_fn
        });

        this.append(build_table(init_table(), this, settings.options));
        return this;
    };



    /* TABLE ACTIONS FUNCTIONS */
    function get_menu_options(table, options) {
        let new_options = Array.from(options);
        let table_options = [];
        let table_header = table.find('thead').first().find('tr').first();
        table_header.children('th').each(function () {
            table_options.push($(this).text())
        });
        return new_options.filter(function (element) {
            return !table_options.includes(element)
        });
    }

    function set_delete_header_btn_action(table, btn_selector, parent_table) {
        const new_table = table.clone(true);
        const table_header_elements = new_table.find('thead>tr').first().clone(true);
        table_header_elements.children('th').each(function (column_id, ele) {
            const delete_btn = $(ele).find(btn_selector).first();
            delete_btn.off('click'); // Reset event
            delete_btn.click(function (event) {
                const display_table = parent_table.find('table');
                const ref_table = del_column((display_table !== undefined) ? display_table : new_table, column_id);
                if (ref_table !== null || ref_table !== undefined) {
                    parent_table.find('table').remove();
                    parent_table.append(build_table(ref_table, parent_table));
                }
            });
        });

        new_table.find('thead>tr').remove();
        new_table.find('thead').append(table_header_elements);

        return new_table;
    }

    function set_delete_row_btn_action(table, btn_selector, parent_table) {
        const new_table = table.clone(true);
        const table_body = new_table.find('tbody').clone(true);
        table_body.children('tr').each(function (row_id, ele) {
            const delete_btn = $(ele).find(btn_selector).first();
            delete_btn.off('click'); // Reset event
            delete_btn.click(function (event) {
                const display_table = parent_table.find('table');
                const ref_table = del_row((display_table !== undefined) ? display_table : new_table, row_id);
                if (ref_table !== null || ref_table !== undefined) {
                    parent_table.find('table').remove();
                    parent_table.append(build_table(ref_table, parent_table));
                }
            });
        });

        new_table.find('tbody').remove();
        new_table.append(table_body);

        return new_table;
    }

    function set_menu_btn_action(table, btn_selector, options, parent_table) {
        const new_table = table.clone(true);
        const table_header_elements = new_table.find('thead>tr').clone(true);
        table_header_elements.children('th').each(function (column_id, ele) {
            const menu_btn = $(ele).children(btn_selector);
            menu_btn.off('click');  // Reset event
            menu_btn.on('click', function (event) {
                if (options.length > 0) {
                    const btn_position = $(event.target).parent().position();
                    const display_table = parent_table.find('table');
                    const target_table_menu = (display_table !== undefined) ? display_table : new_table;
                    const iterative_menu = set_menu_position(edit_header_action(
                        build_floating_menu(options),
                        function (field) {
                            const ref_table = edit_specify_column_name(target_table_menu, field, column_id);
                            parent_table.find('table').remove();
                            parent_table.append(build_table(ref_table, parent_table));
                        }), btn_position);
                    target_table_menu.append(iterative_menu);
                } else {
                    alert("Doesn't have more fields")
                }
            })
        });

        new_table.find('thead>tr').remove();
        new_table.find('thead').append(table_header_elements);

        return new_table;
    }

    function excel_clipboard_raw2squarearray(raw_data) {
        const data = raw_data.split('\n').map(function (ele) {
            return ele.split('\t');
        }).slice(0, -1);

        if (typeof raw_data === "string" && data.length === 0) {
            return [[[raw_data]], 1];  // Fix only 1 data doesn't paste *bug*
        }

        const column_size = data[0].length;
        const filter_data = data.filter(function (ele) {
            return column_size === ele.length;
        });
        if (data.length === filter_data.length) {
            return [data, column_size];
        } else {
            return [null, undefined];
        }
    }

    function make_pastable_tbody(table, parent_table) {
        let new_table = table.clone(true);
        const table_column_length = new_table.find('thead>tr').children('th').length;
        const table_actual_row_length = new_table.find('tbody').children('tr').length;
        const table_body = new_table.find('tbody').first().clone(true);

        table_body.off('paste');
        table_body.on('paste', function (e) {
            e.stopPropagation();
            e.preventDefault();
            const owner_action = $(this);
            const actual_column = $(e.target).index();
            const available_columns = table_column_length - actual_column;
            const [data, columns_to_spend] = excel_clipboard_raw2squarearray(e.originalEvent.clipboardData.getData("text/plain"));
            if (data === null || data === undefined) {
                alert('Data try paste inconsistent ')
            } else if (columns_to_spend > available_columns) {
                alert("Columns number doesn't match with data to paste, check please")
            } else {
                /*const new_rows_size = Math.sqrt(Math.pow(data.length - table_actual_row_length, 2)); */
                const tr = $(e.target).parent();
                const tr_position = tr.index();
                const tbody_rows = owner_action.children('tr').clone(true);
                const row_dummy = $(tbody_rows[0]).clone().children('td').each(function () {
                    $(this).text('');
                }).parent();
                let new_rows = [];

                data.forEach(function (clipdata, idx) {
                    const row = tbody_rows[tr_position + idx];
                    if (row === undefined || row === null) {
                        const dummy = row_dummy.clone();
                        $(dummy).children('td').each(function (column_id, row_ele) {
                            if (column_id >= actual_column) {
                                $(row_ele).text(clipdata[column_id - actual_column]);
                            }
                            if (exist_rows) {
                                if (column_id === 0) {
                                    $(row_ele).text(table_actual_row_length + new_rows.length)
                                }
                            }
                        });
                        new_rows.push(dummy)
                    } else {
                        $(row).children('td').each(function (column_id, row_ele) {
                            if (column_id >= actual_column) {
                                $(row_ele).text(clipdata[column_id - actual_column]);
                            }
                        })
                    }
                });

                owner_action.children('tr').remove();
                owner_action.append(tbody_rows);

                new_rows.forEach(function (row) {
                    owner_action.append(row);
                });

                const display_table = parent_table.find('table');
                let ref_table = del_tbody((display_table !== undefined) ? display_table : new_table, owner_action);
                parent_table.find('table').remove();
                parent_table.append(build_table(ref_table, parent_table));
            }
        });

        new_table.find('tbody').remove();
        new_table.append(table_body);
        return new_table
    }

    function iterative_table(table, parent_table, options) {
        const new_table = table.clone(true);
        const menu_options = get_menu_options(new_table, options);
        return make_pastable_tbody(
            set_delete_row_btn_action(
                set_menu_btn_action(
                    set_delete_header_btn_action(new_table, 'span.delete_column', parent_table),
                    'button.filters', menu_options, parent_table),
                'span.delete_row', parent_table
            ), parent_table
        )
    }

    /* END TABLE ACTIONS */

    /* DRAWERS FUNCTIONS */
    function table_width_fixed(table) {
        // {# Calculate table width #}
        let new_table = table.clone(true);

        let with_total = 0;
        new_table.find('th').each(function () {
            $(this).children().each(function (i, ele) {
                with_total = with_total + ele.offsetWidth;
            });
        });
        return new_table.css('width', (with_total + (with_total / 2)) + 'px');
    }

    function draw_delete_column_btn_header(table, delete_btn_html, delete_btn_selector) {
        let new_table = table.clone(true);
        let new_header = new_table.find('thead>tr').first().clone(true);
        new_header.children('th').each(function (idx, ele) {
            let delete_element = $(this).find(delete_btn_selector);
            let has_delete = (delete_element.length !== 0);
            if ((!exist_rows && idx > 0) || (exist_rows && idx > 1)) {
                if (has_delete) {
                    delete_element.remove();
                }
                $(ele).append(delete_btn_html);
            }
        });
        new_table.find('thead>tr').remove();
        new_table.find('thead').append(new_header);
        return new_table;
    }

    function draw_menu_btn_header(table, menu_btn_html, menu_btn_selector) {
        const new_table = table.clone(true);
        const new_header = new_table.find('thead>tr').first().clone(true);
        new_header.children('th').each(function (idx, ele) {
            let menu_btn = $(this).find(menu_btn_selector);
            let has_menu_btn = (menu_btn.length !== 0);
            if (idx > 0) {
                if (has_menu_btn) {
                    menu_btn.remove();
                }
                $(ele).append(menu_btn_html);
            }
        });
        new_table.find('thead>tr').remove();
        new_table.find('thead').append(new_header);
        return new_table;
    }

    function draw_row_numbers(table, color) {
        if (!color) color = '#0e013b';
        const new_table = table.clone(true);
        const tbody = new_table.find('tbody').clone(true);
        if (exist_rows) {
            tbody.children('tr').each(function (row_id, row) {
                let td = $(row).find('td').first();
                td.text(row_id);
            });
        } else {
            new_table.find('thead>tr').prepend('<th></th>');
            tbody.children('tr').each(function (row_id, row) {
                let td = $(`<td>${row_id}</td>`);
                const dummy = $(td).css({
                    'background': color,
                    'color': '#FFFF',
                    'display': 'inline-block',
                    'width': '100%',
                    'text-align': 'center'
                });
                $(row).prepend(dummy);
            });
            exist_rows = true;
        }
        new_table.find('tbody').remove();
        new_table.append(tbody);
        return new_table
    }

    function draw_row_delete_btn(table) {
        if (exist_rows) {
            const new_table = table.clone(true);
            const tbody = new_table.find('tbody').clone(true);
            tbody.children('tr').each(function (row_id, row) {
                if (row_id > 0) {
                    let td = $(row).find('td').first();
                    td.find('span').remove();
                    const dele_btn = $('<span class="fa fa-trash delete_row"></span></td>').css({
                        'margin-left': '5px',
                        'display': 'inline-block'
                    });
                    td.append(dele_btn);
                }
            });
            new_table.find('tbody').remove();
            new_table.append(tbody);
            return new_table
        } else {
            return table;
        }
    }

    function draw_menu_table(table, add_row_numbers) {
        if (!add_row_numbers) add_row_numbers = false;
        const delete_btn_html = '<span class="fa fa-trash delete_column"></span>';
        const delete_btn_selector = 'span.delete_column';
        const menu_btn_html = '<button class="filters"><span class="caret"></span></button>';
        const menu_btn_selector = 'button.filters';
        const new_table = draw_delete_column_btn_header(draw_menu_btn_header(table, menu_btn_html, menu_btn_selector),
            delete_btn_html, delete_btn_selector);
        if (add_row_numbers) {
            return draw_row_delete_btn(draw_row_numbers(new_table));
        } else {
            return draw_row_delete_btn(new_table);
        }
    }
    /* END DRAWERS */

    /* TABLE GENERAL FUNCTIONS */
    function init_table(initialRows, initialColumns, editableRow) {
        if (!initialRows) initialRows = 5;
        if (!initialColumns) initialColumns = 1;
        if (!editableRow) editableRow = true;
        let table = $('<table id="table_filters" class="table table-bordered table-zina"></table>');

        // {# built table header #}
        let table_header = $("<thead></thead>");
        let column_content = "<th><span class='column_name'></span><button class='filters'><span class='caret'></span></button></th>";
        let header_tr = $("<tr></tr>").append(column_content.repeat(initialColumns));
        table_header.append(header_tr);

        // {# built table body #}
        let table_body = $("<tbody></tbody>");
        let row_content = ((editableRow) ? "<td contenteditable='true'></td>" : "<td></td>");
        let row = "<tr>".concat(row_content.repeat(initialColumns), "</tr>");
        table_body.append(row.repeat(initialRows));

        table.append(table_header);
        table.append(table_body);

        return table;
    }

    function empty_last_column_name(table) {
        let table_last_header = table.find('thead').first().find('tr').children('th').last();
        return table_last_header.text().length === 0
    }

    function build_table(table, table_parent, options) {
        const new_table = table_width_fixed(table.clone(true));
        return iterative_table(draw_menu_table(new_table, true), table_parent, options)
    }
    /* END TABLE GENERAL FUNCTIONS */


    /* MANAGE TABLE CONTENT FUNCTIONS */
    function add_column(table, text) {
        let new_table = table.clone(true);

        const new_th = ((!exist_rows) ? table.find('th').first().clone(true) : table.find('th').last().clone(true));
        new_th.find('span.column_name').text(text);
        new_th.find('button').off('click');  // Dismiss whatever click event on button
        const new_row = table.find('tbody').children('tr').clone(true);
        new_row.each(function () {
            let td = $(this).children('td').clone(true).text('')[((!exist_rows) ? 0 : 1)];
            this.append(td)
        });
        new_table.find('thead>tr').append(new_th);
        new_table.find('tbody>tr').remove();
        new_table.find('tbody').append(new_row);
        return new_table
    }

    function edit_specify_column_name(table, text, column_id) {
        let new_table = table.clone(true);
        new_table.find('thead>tr').children('th').map(function (i, ele) {
            if (i === column_id) {
                $(ele).find('span.column_name').text(text);
            }
        });
        return new_table
    }

    function edit_last_column_header(table, text) {
        let new_table = table.clone(true);
        let table_last_header = new_table.find('thead').first().find('tr').children('th').last();
        table_last_header.find('span.column_name').text(text);
        return new_table
    }

    function add_row(table) {
        let new_table = table.clone(true);
        const new_row = table.find('tbody').children('tr').first();
        new_row.find('td').text('');
        if (exist_rows) {
            const actual_rows = table.find('tbody').children('tr').length;
            new_row.find('td').first().text(actual_rows);
        }
        new_table.find('tbody').append(new_row);
        return new_table
    }

    function del_column(table, col_idx) {
        if (col_idx > 0) {
            let new_table = table.clone(true);
            let table_header = new_table.find('thead>tr').first().clone(true);
            table_header.children('th')[col_idx].remove();

            let table_body = new_table.find('tbody>tr').clone(true);
            table_body.each(function () {
                $(this).children('td')[col_idx].remove();
            });

            new_table.find('thead>tr').remove();
            new_table.find('thead').append(table_header);
            new_table.find('tbody>tr').remove();
            new_table.find('tbody').append(table_body);

            return new_table
        }
        return null
    }

    function del_row(table, row_idx) {
        let new_table = table.clone(true);
        let table_body = new_table.find('tbody').clone(true);
        table_body.children('tr')[row_idx].remove();
        new_table.find('tbody').remove();
        new_table.append(table_body);

        return new_table;
    }

    function del_tbody(table, new_body) {
        let new_table = table.clone(true);
        new_table.find('tbody').remove();
        new_table.append(new_body);
        return new_table;
    }
    /* END TABLE CONTENT FUNCTIONS */


    /* FLOATING MENU FUNCTIONALITY */
    function draw_menu_options(options, menu_container) {
        if (!menu_container) {
            menu_container = $('<nav class="filters-menu" id="filters-menu"></nav>');
        } else {
            menu_container = menu_container.clone(true);
        }
        const menu = $('<ul class="filters-menu__items"></ul>');
        options.forEach(function (ele) {
            menu.append('<li class="filters-menu__item"><a class="filters-menu__link">'.concat(ele, "</a></li>"))
        });
        return menu_container.append(menu);
    }

    function build_floating_menu(options) {
        return draw_menu_options(options)
    }

    function edit_header_action(menu, action_fnc) {
        const new_menu = menu.clone(true);
        new_menu.find('ul').children('li').each(function () {
            $(this).off('click');
            $(this).on('click', function (event) {
                $(this).parent().parent().remove();
                action_fnc($(this).text());
            })
        });
        return new_menu;
    }

    function set_menu_position(menu, positions) {
        const new_menu = menu.clone(true);
        new_menu.css({
            'left': positions.left,
            'top': positions.top
        });
        return new_menu
    }

    function click_inside_element(element, click_element) {
        let parent = click_element;
        let status = false;
        while (parent !== undefined && parent !== null) {
            if (parent === element) {
                status = true;
                break
            }
            parent = parent.parentNode;
        }
        return status
    }

    $(document).on('click', function (event) {
        const menu = $('#_table').children('table').children('nav');  // Fix Multiple menu display *bug*
        if (menu.length > 0) {
            if (!click_inside_element(menu, event.target)) {
                click_outside = click_outside + 1;
                if (click_outside > 1) {
                    menu.remove();
                    click_outside = 0;
                }
            }
        } else {
            click_outside = 0;  // Fix multiple clicks required to display menu *bug*
        }
    });
    /* END MENU FUNCTIONALITY */


    /* MODAL FUNCTIONALITY */
    function serialize_table_data(table, subproject) {
        let dummy_obj = {key: subproject, value: null};  // TODO DELETE !!!!!
        let values = [];
        table.find('th').each(function (idx, header) {
            let filter_obj = {key: '"'.concat($(header).text(), '"'), value: null};
            if (filter_obj.key !== '') {
                let filters = [];
                table.find('tbody>tr').each(function () {
                    let filter = $(this).children('td')[idx];
                    let data = $(filter).text();
                    let filter_value = '"'.concat($(filter).text(), '"');
                    if (data !== '' && !filters.includes(filter_value)) {
                        filters.push(filter_value);
                    }
                });
                filter_obj.value = '[' + filters.toString() + ']';
            }
            if (filter_obj.key !== '' && filter_obj.value != null && filter_obj.value !== '[]') {
                values.push("{".concat(filter_obj.key, ':', filter_obj.value, '}'));
            }
        });

        dummy_obj.value = '['.concat(values.slice(1).toString(), ']');

        return dummy_obj
    }

    function get_base_modal(title, bs_level) {
        if (!bs_level) bs_level = 'default';
        let moda_content_container = $('<div class="modal-dialog"></div>');
        let modal_content = $('<div class="modal-content"></div>');
        modal_content.append(`<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">${title}</h4></div>`);
        modal_content.append('<div class="modal-body"></div></div>');
        modal_content.append(`<div class="modal-footer"><button type="button" class="btn btn-${bs_level}" data-dismiss="modal">Close</button>`);
        moda_content_container.append(modal_content);
        return $('<div id="myModal" class="modal fade" role="dialog"></div>').append(moda_content_container);
    }

    function built_modal_option_body(modal, options, without_close) {
        if (!without_close) without_close = false;
        let new_modal = modal.clone(true);
        let list_html = $('<ul style="list-style: none"></ul>');
        options.forEach(function (ele, x) {
            list_html.append(`<li><input type="radio" name="field" id="id_${x}" value="${ele}"> <label for="id_${x}">${ele}</lable></li>`)
        });
        new_modal.find('div.modal-body').first().append(list_html);

        new_modal.find('div.modal-body').on('change', function () {
            const dismiss_btn = $(this).parent().find('button').filter(function (i, ele) {
                return ele.dataset.dismiss === "modal" && $(ele).parent().hasClass("modal-footer")
            });
            if (without_close) {
                new_modal.modal('toggle');
            } else {
                dismiss_btn.removeClass();
                dismiss_btn.addClass('btn').addClass('btn-success');
                dismiss_btn.text('Set field');
            }
        });
        return new_modal;
    }
    /* END MODAL FUNCTIONALITY */


})(jQuery);