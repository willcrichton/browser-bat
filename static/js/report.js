function create_table(cur_source) {
  source_url = '/report_' + cur_source;
  selector = '#' + cur_source + '_table';
  $(selector).dataTable({
      'bProcessing': true,
      'bServerSide': true,
      'sAjaxSource': source_url,
      'sDom': 'T<"clear">lfrtip',
      'oTableTools': {
          'sSwfPath': '/static/swf/copy_csv_xls_pdf.swf'
      }
  });
}

create_table('visits');
create_table('downloads');
