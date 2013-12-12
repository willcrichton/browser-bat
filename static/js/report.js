$(function() {
    $('table').dataTable({
        'bProcessing': true,
        'bServerSide': true,
        'sAjaxSource': '/report',
        'sDom': 'T<"clear">lfrtip',
        'oTableTools': {
            'sSwfPath': '/static/swf/copy_csv_xls_pdf.swf'
        }
    });
});
